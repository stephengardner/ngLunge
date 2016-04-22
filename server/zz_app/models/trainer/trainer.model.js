'use strict';

var _ = require('lodash');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
var crypto = require('crypto');
var validator = require("validator");

var authTypes = ['email'];

var TrainerSchema = new Schema(
	{
		id : { type : Number },
		email : { type : String, unique : true },
		name : { first : {type : String, required : false}, last : {type : String, required : false} },
		gender : {
			value : { type : String, default : 'none' },
			privacy : { type : String, default : 'private' }
		},
		birthday : {
			value : { type : String, default : '-' },
			privacy : { type : String, default : 'private' }
		},
		registration : {
			sent : { type : Number },
			verified : { type : Boolean, default : false },
			sent_at : Date,
			resend : { type : Boolean, default : false },
			email : String,
			authenticationHash : { type : String }
		},
		specialties : [{type : Schema.Types.ObjectId, ref : 'Specialty'}],
		socket : { type : Object },
		// Their rate per hour
		rate : {
			type : Object,
			general : {
				type : Object,
				price : { type : Number },
				comments : { type : String }
			}
		},
		location: {
			title : { type : String, default : "Main Location", required : false },
			google : {
				placesAPI : {
					formatted_address : { type : String }
				}
			},
			primary : { type : Boolean, default : true },
			address_line_1 : {type : String, required : false},
			address_line_2 : {type : String, required : false},
			city : {type : String, required : false},
			state : {type : String, required : false},
			zipcode : {type : String, required : false},
			coords : {
				type : Object,
				lat : { type : Number },
				lon : { type : Number }
			},
			smarty_streets_response : {}
		},
		locations : [{
			google : {
				placesAPI : {
					formatted_address : { type : String }
				}
			},
			primary : { type : Boolean, default : false },
			title : { type : String },
			type : { type : String, required : false },
			address_line_1 : {type : String, required : true},
			address_line_2 : {type : String, required : false},
			city : {type : String, required : true},
			state : {type : String, required : true},
			zipcode : {type : String, required : false},
			coords : {
				lat : { type : Number },
				lon : { type : Number }
			},
			smarty_streets_response : {}
		}],
		active: {type : Boolean, default : 1},
		rating : {type : Number, default : 0},
		profile_picture : {high_resolution : {url : {type : String}}, medium_resolution : {url : {type : String}}, thumbnail : {url : {type : String, default : "/assets/images/default-profile-picture.jpg"}}},
		type : String,
		salt : String,
		bio : { type : String, required : false },
		role: {
			type: String,
			default: 'trainer'
		},
		urlNameChanged : { type : Boolean, required : false },
		urlName : {type : String, default : "error" },
		//me : Boolean,
		hashedPassword : String,
		verified: { type : Boolean, default : false },
		provider : { type : String },
		alerts : {
			profile : {
				home : Array
			}
		},
		certifications_v2 : [{ type : Schema.Types.ObjectId, ref : 'CertificationType' }],
		facebook: {},
		linkedin : {},
		twitter: {},
		google: {},
		github: {},
		certs : {
		}
		//certifications : [{ type : Schema.Types.ObjectId, ref : 'CertificationType' }]//,
		//certifications : [{type : Schema.Types.ObjectId, ref : 'CertificationTypes'}]
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	}
);

var validatePresenceOf = function(value) {
	return value && value.length;
};
// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {

	// null and undefined are "empty"
	if (obj == null) return true;

	// Assume if it has a length property with a non-zero value
	// that that property is correct.
	if (obj.length > 0)    return false;
	if (obj.length === 0)  return true;

	// Otherwise, does it have any properties of its own?
	// Note that this doesn't handle
	// toString and valueOf enumeration bugs in IE < 9
	for (var key in obj) {
		if (hasOwnProperty.call(obj, key)) return false;
	}

	return true;
}

require("./schema-functions/location")(TrainerSchema);
/*al('urlName').get(function () {
 return this.name.first.toLowerCase() + '-' + this.name.last.toLowerCase();
 });
 */
TrainerSchema.virtual('name.full').get(function () {
	if(this.name.last && this.name.first) {
		return this.name.first + ' ' + this.name.last;
	}
	else if(this.name.first) {
		return this.name.first;
	}
	else
		return this.name.last;
}).set(function(fullName) {
	var regexp = /^[a-zA-Z- ]+$/
	function isValid(str) { return regexp.test(str); }
	if(!isValid(fullName)){
		return this.invalidate('name', 'Only letters and hyphens are allowed in a name');
	}
	// when setting full name, set the first name as the first element and the last name as the last element
	this.name = {};
	var fullName = fullName.split(" ");
	if(fullName && fullName[0]) {
		this.name.first = fullName[0];
	}
	if(fullName.length && fullName.length > 1) {
		this.name.last = fullName[fullName.length - 1];
	}
});


// Before saving, make sure the speacialties that are passed in are just an array of objectIDs.
// - Since they will likely be coming in as full objects, strip everything from them except the _id.
TrainerSchema.pre('save', function(next){
	console.log("-___________________________\n_____________________\n_____________________\n");
	// remove empty specialties
	this.specialties = this.specialties.filter(function(specialty) {
		if(typeof specialty != 'object') {
			return this.invalidate('specialty', 'Please type a valid specialty');
		}
		return specialty != null && specialty != undefined
	})
		// map the specialties array to objectIDs only.  If they come in as objects, they leave as IDs
		.map(function(specialty){
			if(!specialty) return undefined;
			if(specialty._id) return specialty._id;
			else return specialty;
		})
	next();
});


/**
 * Trainer.urlName Pre-save hook
 */
// When saving a trainer, set their initial urlName to be their email address
// if someone else has already used that email address for a different domain,
// ex: augdog@gmail vs augdog@yahoo, then append a "-2" onto the end of the name.
// or, append a -# (where # is the next number in the sequence), if there are more than two (highly unlikely).
TrainerSchema
	.pre('save', function(next) {
		console.log("PRESAVE!\n\n\n\n");
		if (!this.isNew) return next();
		var newUrlName = this.email.split("@");
		newUrlName = newUrlName[0];
		var self = this;
		var emailSplit = self.email.split("@");
		emailSplit = emailSplit[0];
		this.constructor.find({urlName: new RegExp(emailSplit, "i")}, null, {sort : {urlName : -1 }}, function(err, trainer) {
			if(err) throw err;
			if(trainer.length) {
				var maxUrlName = trainer[0].urlName,
					secondToLastChar = maxUrlName.charAt(maxUrlName.length - 2),
					lastChar = maxUrlName.charAt(maxUrlName.length - 1);
				if(secondToLastChar == "-")
					newUrlName = maxUrlName.substr(0, maxUrlName.length - 2) + "-" + (parseInt(lastChar) + 1);
				else {
					newUrlName = maxUrlName + "-2";
				}
				self.urlName = newUrlName;
			}
			else {
				self.urlName = newUrlName;
			}
			next();
		});
	});

TrainerSchema.pre('save', function(next){
	console.log("-\n-\n-\n-\n-");
	console.log("-------------", this.certifications);
	next();
});

TrainerSchema
	.pre('save', function(next) {
		for(var key in this.certs ) {
			if(this.certs[key].length == 0) {
				var deleteKey = require('key-del');
				this.markModified('certs');
				this.markModified('certs.' + key);
				this.certs = deleteKey(this.certs, key);
			}
		}
		next();
	});

TrainerSchema
	.path('certs')
	.validate(function(certs) {
		for(var key in certs ) {
			var isFound = [];
			for(var i = 0; i < certs[key].length; i++) {
				if(isFound.indexOf(certs[key][i].name) != -1) {
					console.log("isFound:", isFound, " HAS: ", certs[key][i].name);
					return this.invalidate('certification', 'The certification: ' + certs[key][i].name + ' has already been added');
				}
				isFound.push(certs[key][i].name);
			}
		}
	}, 'Lunge Certification Error');


/**
 * Pre-save hook
 */
TrainerSchema
	.pre('save', function(next) {
		if (!this.isNew) return next();

		if (this.registration && this.registration.verified &&
			!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
			next(new Error('Invalid password'));
		else
			next();
	});

/**
 * Virtuals
 */

var async = require("async");
TrainerSchema.virtual('certifications_v2_coagulated')
	.get(function(){
		var trainer = this;
		var certificationsCoagulated = {};
		var returnArray = [];
		// first populate the certification as an object, then send it back as an array to make it easier to parse on
		// the client side using an ng-repeat over an array not an object.
		// there could be a better way to do this, but this is OK for now.  know that an async method will not work
		// AFAIK, in virtuals.
		if(trainer.certifications_v2 && trainer.certifications_v2.length){
			for(var i = 0; i < trainer.certifications_v2.length; i++) {
				var certType = trainer.certifications_v2[i];
				// note - possible invalid values when populating in abstract methods
				// for example, during the Auth.isTrainerMe() call, we don't really need to populate this, so we don't.
				// therefore the certType.organization.name will not be populated
				// so in that case if this returns an empty set that's ok.
				// WE COULD populate it in isTrainerMe() and then not bother in the actual controller method
				// in-fact, that's probably ideal
				if(certType.organization && certType.organization.name) {
					var key = certificationsCoagulated[certType.organization.name];
					if(certType.active) {
						delete certType.active;
						if(!key){
							certificationsCoagulated[certType.organization.name] = {
								types : [{
									_id : certType._id,
									name : certType.name
								}]
							};
						}
						else {
							certificationsCoagulated[certType.organization.name].types.push({
								_id : certType._id,
								name : certType.name
							});
						}
					}
				}
			}
		}
		for(var name in certificationsCoagulated){
			returnArray.push({
				name : name,
				isOpen : false,
				types : certificationsCoagulated[name].types
			});
		}
		return returnArray;
	});

TrainerSchema
	.virtual('password')
	.set(function(password) {
		password = password ? password : "";
		this._password = password;
		this.salt = this.makeSalt();
		this.hashedPassword = this.encryptPassword(password);
	})
	.get(function() {
		return this._password;
	});
/*
 TrainerSchema.pre('validate', function(next) {
 var rate = this.rate;
 console.log("THE RATE:", rate);
 function isNumeric(n) {
 return !isNaN(parseFloat(n));
 }
 if(1){
 console.log("\nERROR\n\n\n\n");
 next(Error('Please enter a number3'));
 }
 else{
 next();
 }
 });
 */
TrainerSchema.path('rate')
	.validate(function(rate){
		console.log("\n\nValidating rate:", rate);
		function isNumeric(n) {
			return !isNaN(n);
		}
		var rateGeneralPrice = rate.general.price;
		if(!isNumeric(rateGeneralPrice)){
			this.invalidate('rateGeneralPrice', 'Please enter a number');
		}
	})
/*
 TrainerSchema.path('rate.general.comments')
 .validate(function(generalRateComments){
 console.log("*\n*\n*\n*\nGENERALRATECOMMENTS\n*\n*");
 if(generalRateComments && generalRateComments.length && generalRateComments.length > 200) {
 this.invalidate('generalRateComments', 'Please limit the comments to less than 200 characters');
 }
 })
 TrainerSchema.path('rate.general.price')
 .validate(function(generalRatePrice){
 console.log("*\n*\n*\n*\nGENERALRATEPRICE\n*\n*");
 this.invalidate('generalRatePrice', 'Please enter a number');
 if(!isNumeric(generalRatePrice)){
 this.invalidate('generalRatePrice', 'Please enter a number');
 }
 })
 */
// Validate empty password
TrainerSchema
	.path('hashedPassword')
	.validate(function(hashedPassword) {
		if(!hashedPassword.length) {
			return this.invalidate('password', 'Password cannot be blank.');
		}
		else {
			if (this._password) {
				if (this._password.length < 6 || this._password.length > 15) {
					return this.invalidate('password', 'Password must be between 6 and 15 characters.');
				}
				else {
				}
			}
		}
	}, 'Password cannot be blank');

// Validate empty password
TrainerSchema
	.path('name.first')
	.validate(function(value) {
		if(this.name && this.name.first) {
			if(this.name.first.length < 3) {
				this.invalidate('name', 'Please use a longer name');
			}
			else if(this.name.first.length > 20) {
				this.invalidate('name', 'Please use a shorter first name');
			}
			else if(this.name.last && this.name.last.length > 20) {
				this.invalidate('name', 'Please use a shorter last name');
			}
		}
	}, 'Name is not valid');

/**
 * Pre-save hook
 */
TrainerSchema
	.pre('save', function(next) {
		if (!this.isNew) return next();

		if (this.registration && this.registration.verified && !validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
			next(new Error('Invalid password'));
		else {
			this.alerts.profile.home = [
				{
					closed : false,
					type : "success",
					title : "Welcome to your Lunge profile!",
					sub : "Add more information about yourself and your expertise"
				}
			]
			next();
		}
	});

// Validate email is not taken
TrainerSchema
	.path('email')
	.validate(function(value, respond) {
		var self = this;
		this.constructor.findOne({email: value}, function(err, trainer) {
			if(err) throw err;
			if(trainer) {
				if(self.id === trainer.id) return respond(true);
				return respond(false);
			}
			respond(true);
		});
	}, 'The specified email address is already in use.');

TrainerSchema
	.path('email')
	.validate(function(value) {
		var self = this;
		if(!value) {
			return this.invalidate('email', 'Enter an email');
		}
		if(!validator.isEmail(value)) {
			return this.invalidate('email', 'Please use a valid email address');
		}
	}, 'The specified email address is already in use.');

// Force uniqueifying the specialties
TrainerSchema.pre('save', function(next){
	var specialties = this.specialties;

	var flags = [], output = [], l = specialties.length, i;

	for( i=0; i<l; i++) {
		if( flags[specialties[i]]) continue;
		flags[specialties[i]] = true;
		output.push(specialties[i]);
	}
	this.specialties = output;
	next();
})
/*
 TrainerSchema
 .pre('validate', function(next){
 var specialties = this.specialties;
 for(var i = 0; i < specialties.length; i++) {
 var specialty = specialties[i];
 if(!specialty.length || (!specialty._id && !mongoose.Types.ObjectId(specialty.toString()).isValid())){
 console.log("Invalidating Specialty:", specialty);
 return next(this.invalidate('specialty', 'Please type a valid specaialty'));
 }
 };
 next();
 })
 */
/*
 TrainerSchema.pre('save', function(next){
 var specialties = this.specialties;
 var dupeFound = false;
 for(var i = 0; i < specialties.length; i++) {
 var specialtyInitial = specialties[i];
 for(var k = 0; k < specialties.length; k++) {
 var specialtyToCheckAgainst = specialties[k];
 //console.log("Checking specialty:", specialtyInitial, " vs ", specialtyToCheckAgainst);
 if(specialtyInitial.toString() == specialtyToCheckAgainst.toString()){
 specialties.splice(i, 1);
 return this.invalidate('specialty', 'This specialty has already been added!');
 }
 }
 }
 console.log("Nothing wrong");
 next();
 })
 */
// Validate email is not taken
TrainerSchema
	.path('urlName')
	.validate(function(value, respond) {
		var self = this;
		this.constructor.findOne({urlName: value}).exec(function(err, trainer){
			if(err) throw err;
			if(trainer) {
				if(self.id == trainer.id){
					return respond(true);
				}
				return respond(false);
			}
			respond(true);
		});
	}, 'That custom url is already in use.');// Validate email is not taken

TrainerSchema
	.path('urlName')
	.validate(function(value, respond) {
		var self = this;
		var regexp = /^[a-zA-Z0-9-_]+$/
		function isValid(str) { return regexp.test(str); }
		if(!isValid(value)){
			respond(false);
		}
		respond(true);
	}, 'One letters, numbers, and dashes are allowed in a custom URL.');

TrainerSchema
	.path('bio')
	.validate(function(value, respond) {
		if(value.length > 300) {
			respond(false);
		}
		respond(true);
	}, 'Bio must be less than 300 characters.');

/**
 * Methods
 */
var methods = {

	/**
	 * Authenticate - check if the passwords are the same
	 *
	 * @param {String} plainText
	 * @return {Boolean}
	 * @api public
	 */
	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.hashedPassword;
	},

	/**
	 * Make salt
	 *
	 * @return {String}
	 * @api public
	 */
	makeSalt: function() {
		return crypto.randomBytes(16).toString('base64');
	},

	hasLocationObject : function() {
		return this.location.state;
	},

	hasLocationsArray : function() {
		return this.locations.length;
	},
	/**
	 * Compare Locations (created by augie)
	 *
	 * @return {Boolean}
	 * @api public
	 */
	compareLocationTo : function(location) {
		return this.location && this.location.coords && location.coords && location.coords.lat == this.location.coords.lat && location.coords.lon == this.location.coords.lon;
	},
	/**
	 * Encrypt password
	 *
	 * @param {String} password
	 * @return {String}
	 * @api public
	 */
	encryptPassword: function(password) {
		if (!password || !this.salt) return '';
		var salt = new Buffer(this.salt, 'base64');
		return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
	}
};

// UNUSED RIGHT NOW. was trying to setup socket....
module.exports.setup = function(socket) {
	console.log("FUCK THE WORLD");
	TrainerSchema.methods.emitLogin = function() {
		socket.emit("trainer:login", this);
	}
	TrainerSchema.plugin(autoIncrement.plugin, { model: 'Trainer', field: 'id' });
	return mongoose.model('Trainer', TrainerSchema);
}

TrainerSchema.plugin(autoIncrement.plugin, { model: 'Trainer', field: 'id' });

module.exports = function createModel(app) {
	TrainerSchema.methods = methods;
	var Model = app.connections.db.model('Trainer', TrainerSchema);
	return Model;
};