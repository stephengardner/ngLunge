'use strict';

var _ = require('lodash');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment'),
	crypto = require('crypto'),
	validator = require("validator")
	;

var authTypes = ['email'];

var options = {
	discriminatorKey : 'kind',
	toObject: { virtuals: true },
	toJSON: { virtuals: true }
};

var TrainerSchema = new Schema(
	{
		// id : { type : Number },
		email : { type : String },
		website : String,
		name : {
			first : {
				type : String, required : false
			},
			last : {type : String, required : false}
		},
		headline : {
			value : { type : String },
			privacy : { type : String, default : 'public' }
		},
		gender : {
			value : { type : String, default : 'none' },
			privacy : { type : String, default : 'private' }
		},
		birthday : {
			value : { type : String, default : '-' },
			privacy : { type : String, default : 'private' }
		},
		age : {
			value : { type : String, default : '-' },
			privacy : { type : String, default : 'private' }
		},
		years_of_experience : {
			value : { type : String, default : '-' },
			privacy : { type : String, default : 'public' }
		},
		password_reset : {
			created_at : { type : Date, default : new Date() },
			used_at : Date,
			expires_at : Date,
			authenticationHash : { type : String },
			active : { type : Boolean, default : true }
		},
		registration : {
			sent : { type : Number },
			email_verified : { type : Boolean, default : false },
			password_set : { type : Boolean, default : false },
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
		registration_providers : {
			facebook : String,
			linkedin : String,
			google : String,
			twitter : String,
			local : { type : Boolean, default : false }
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
			address_line_1 : {type : String, required : false},
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
		active: {type : Boolean, default : true},
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
		certifications_meta : {
			organization_map : {
				// 'organization_id' : {
				// name : String,
				// types : {
					// all : [],
					// unverified : [],
					// pending : [],
					// approved : [],
					// rejected : []
				//}
				// }
			},
			types_by_organization : [{
				organization : {type : Schema.Types.ObjectId, ref : 'CertificationOrganization'},
				all : [],
				unverified : [],
				pending : [],
				approved : [],
				rejected : []
			}]
		},
		certifications_v2 : [{
			certification_type : { type : Schema.Types.ObjectId, ref : 'CertificationType' },
			// When someone removes a cert, we can save their info by just deactivating it.
			// this isn't implemented, YET.
			active : { type : Boolean, default : true },
			verification : {
				files : [{
					user_desired_name : String,
					s3_url : String,
					originalname : String,
					encoding : String,
					mimetype : String,
					destination : String,
					dilename : String,
					path : String,
					size : Number,
					uploaded_at : Date,
					active : { type : Boolean, default : true },
					status : { type : String, default : 'Pending', enum : ['Pending', 'Approved', 'Rejected']}
				}],
				status : { type : String, default : 'Unverified',
					enum : [
						'Unverified',
						'Pending',
						'Approved',
						'Rejected'
					]},
				verified : { type : Boolean, default : false }
			}
		}],
		//certification_verifications :
		facebook: {},
		linkedin : {},
		instagram : {},
		twitter: {},
		google: {},
		github: {},
		certs : {
		},
		email_inquiries : [
			{
				sent : { type : Number, default : 0 },
				user : {
					reference : { type : Schema.Types.ObjectId, ref : 'User' },
					name : {
						first: { type : String, required : true },
						last : String,
						full : String
					},
					email : String
				},
				message : String
			}
		]
		//certifications : [{ type : Schema.Types.ObjectId, ref : 'CertificationType' }]//,
		//certifications : [{type : Schema.Types.ObjectId, ref : 'CertificationTypes'}]
	},
	options
);

var validatePresenceOf = function(value) {
	return value && value.length;
};

// TrainerSchema.virtual('name.full')
// 	.get(function () {
// 		return this.name.first + ' ' + this.name.last;
// 	})
// 	.set(function (setFullNameTo) {
// 		console.log("Setting full name to: ", setFullNameTo);
// 		if(setFullNameTo) {
// 			var split = setFullNameTo.split(' ')
// 				, firstName = split[0]
// 				, lastName = split[1];
//
// 			this.set('name.first', firstName);
// 			this.set('name.last', lastName);
// 		}
// 	});

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
	console.log("SETTTTTTTTTTTTTTTTTTTTTTING", fullName);
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

TrainerSchema.pre('save', function(next){
	if(this.email) {
		this.email = this.email.toLowerCase();
		next();
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
		if (!this.isNew || !this.email) return next();
		var newUrlName = this.email.split("@");
		newUrlName = newUrlName[0];
		var self = this;
		var emailSplit = self.email.split("@");
		emailSplit = emailSplit[0];
		this.constructor
			.find({
					urlName: new RegExp(emailSplit, "i")
				},
				null,
				{sort : {urlName : -1 }},
				function(err, trainer) {
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
	if(this.rate && this.rate.general) {
		if(this.rate.general.price) {
			var price = Number(this.rate.general.price);
			price = price.toFixed(2);
			this.rate.general.price = price;
		}
	}
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

TrainerSchema
	.path('email_inquiries')
	.validate(function(inquiries) {
		var inquiryLength = inquiries.length,
			lastInquiry = inquiries[inquiries.length - 1]
			;
		if(!inquiryLength || !lastInquiry) return;
		// for(var i = 0; i < inquiries.length; i++) {
		var inquiry = lastInquiry;//inquiries[i];
		// First Name
		console.log("inquiry is new?", inquiry.isNew);
		if(!inquiry.user.name.first) {
			this.invalidate('firstName', 'The email inquiry requires a first name');
		}
		else if(!validator.isAlphanumeric(inquiry.user.name.first)) {
			this.invalidate('firstName', 'Invalid first name');
		}
		else if(inquiry.user.name.first.length > 30) {
			this.invalidate('firstName', 'Please use a name shorter than 30 characters');
		}
		// Email
		if(!inquiry.user.email) {
			this.invalidate('email', 'Please input an email address');
		}
		else if(!validator.isEmail(inquiry.user.email)) {
			this.invalidate('email', 'Please use a valid email address');
		}
		// Message
		if(!inquiry.message) {
			this.invalidate('message', 'Please add a message');
		}
		else if(!validator.isLength(inquiry.message, {max : 1000})) {
			this.invalidate('message', 'Please limit your message to 1000 characters');
		}
		// }
	}, 'Lunge Email Inquiry Error');


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

// deprecated
/*
TrainerSchema.virtual('certifications_v2_coagulated')
	.get(function(){
		var trainer = this;
		var certificationsCoagulated = {};
		var returnArray = [];
		// first populate the certification as an object, then send it back as an array to make it easier
		// to parse on
		// the client side using an ng-repeat over an array not an object.
		// there could be a better way to do this, but this is OK for now.  know that an async method will
		// not work
		// AFAIK, in virtuals.
		if(trainer.certifications_v2 && trainer.certifications_v2.length){
			for(var i = 0; i < trainer.certifications_v2.length; i++) {
				var certification_v2 = trainer.certifications_v2[i];
				// note - possible invalid values when populating in abstract methods
				// for example, during the Auth.isTrainerMe() call, we don't really need to populate this,
				// so we don't.
				// therefore the certType.organization.name will not be populated
				// so in that case if this returns an empty set that's ok.
				// WE COULD populate it in isTrainerMe() and then not bother in the actual controller
				// method
				// in-fact, that's probably ideal
				if(certification_v2.certification_type
					&& certification_v2.certification_type.organization
					&& certification_v2.certification_type.organization.name) {
					var organizationName = certification_v2.certification_type.organization.name;
					var objectProp = certificationsCoagulated[organizationName];
					//certificationsCoagulated[certification_v2.certification_type.organization.name];
					if(certification_v2.certification_type.active) {
						delete certification_v2.certification_type.active;
						if(!objectProp){
							certificationsCoagulated[organizationName] = {
								types : [],
								unverified : [],
								pending : [],
								verified : []
							};
						}
						var certTypeObj = {
							certification_type : certification_v2.certification_type,
							_id : certification_v2._id,
							name : certification_v2.certification_type.name,
							verification : certification_v2.verification
						};
						certificationsCoagulated[organizationName].types.push(certTypeObj);
						if(certification_v2.verification.status == 'Unverified') {
							certificationsCoagulated[organizationName].unverified.push(certTypeObj);
						}
						if(certification_v2.verification.status == 'Pending') {
							certificationsCoagulated[organizationName].pending.push(certTypeObj);
						}
						if(certification_v2.verification.status == 'Verified') {
							certificationsCoagulated[organizationName].verified.push(certTypeObj);
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
*/
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
		this.constructor.findOne({email: value, kind : 'trainer'}, function(err, trainer) {
			if(err) throw err;
			if(trainer) {
				if(self.id === trainer.id) return respond(true);
				console.log("whats going on? ::: " + trainer.id);
				console.log("\n\n", self);
				return respond(false);
			}
			respond(true);
		});
	}, 'The specified email address ' +
		'is already in use.');

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
		this.constructor.findOne({urlName: value, kind : 'trainer'}).exec(function(err, trainer){
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
		if(value.length > 2000) {
			respond(false);
		}
		respond(true);
	}, 'Bio must be less than 2000 characters.');

TrainerSchema
	.path('headline.value')
	.validate(function(value, respond) {
		if(value && value.length > 60) {
			this.invalidate('headline', 'Please limit your headline to 60 characters');
		}
		respond(true);
	}, 'Headline must be less than 60 characters.');

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

module.exports = function setup(options, imports, register) {
	var certificationMapCreator = imports.certificationMapCreator,
		userModel = imports.userModel,
		newUserSignupMessageSender = imports.newUserSignupMessageSender,
		logger = imports.logger
	;

	TrainerSchema.post('save', function(){
		if(!this.wasNew) {
			console.log(" ++ not wasNew ++");
		}
		else {
			console.log(" ++ wasNew ++");
			newUserSignupMessageSender.send(this).then(function(response){
				
			}).catch(function(err) {
				logger.error(err);
			});
		}
	});
	TrainerSchema.pre('save', function(next){
		if(this.isNew) {
			this.wasNew = true;
		}
		next();
	});
	TrainerSchema.pre('save', function(next){
		imports.certificationsMetaUpdater.update(this).then(function(){
			console.log("this.certifications_meta ===== ", this.certifications_meta.types_by_organization);
			this.markModified('certifications_meta');
			this.markModified('certifications_meta.types_by_organization');
			next();
		}.bind(this)).catch(next);
	});

	TrainerSchema.virtual('certifications_v2_map').get(function(){
		var trainer = this;
		if(trainer.certifications_v2 && trainer.certifications_v2.length) {
			var areAllPopulated = true;
			for(var i = 0; i < trainer.certifications_v2.length; i++ ){
				var certification_v2 = trainer.certifications_v2[i];
				if(
					!certification_v2.certification_type
					|| !certification_v2.certification_type._id
					|| !certification_v2.certification_type.organization
					|| !certification_v2.certification_type.organization._id) {
					areAllPopulated = false;
				}
			}
			if(areAllPopulated) {
				return(certificationMapCreator.createWithoutPopulating(trainer));
			}
		}
	});

	TrainerSchema.methods = methods;
	var connectionDatabase = imports.connectionDatabase;
	var Model = userModel.discriminator('trainer', TrainerSchema);
	// var Model = connectionDatabase.model('Trainer', TrainerSchema);

	// TrainerSchema.plugin(autoIncrement.plugin, { model: 'Trainer', field: 'id' });
	register(null, {
		trainerModel : Model
	});
};