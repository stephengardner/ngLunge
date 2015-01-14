'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
var crypto = require('crypto');

var authTypes = ['email'];

var TrainerSchema = new Schema(
	{
		id : { type : Number },
		email : { type : String, unique : true },
		name : { first : {type : String, required : false}, last : {type : String, required : false} },
		socket : { type : Object },
		location: {
			google : {
				placesAPI : {
					formatted_address : { type : String }
				}
			},
			primary : { type : Boolean, default : true },
			type : { type : String, required : false },
			address_line_1 : {type : String, required : false},
			address_line_2 : {type : String, required : false},
			city : {type : String, required : false},
			state : {type : String, required : false},
			zipcode : {type : Number, required : false},
			coords : {
				lat : { type : Number },
				lon : { type : Number }
			}
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
			city : {type : String, required : false},
			state : {type : String, required : false},
			zipcode : {type : Number, required : false},
			coords : {
				lat : { type : Number },
				lon : { type : Number }
			}
		}],
		active: {type : Boolean, default : 1},
		rating : {type : Number, default : 0},
		profile_picture : {high_resolution : {url : {type : String}}, medium_resolution : {url : {type : String}}, thumbnail : {url : {type : String, default : "/assets/images/trainers/testImage.jpg"}}},
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

		facebook: {},
		linkedin : {},
		twitter: {},
		google: {},
		github: {},
		certs : {
		},
		certifications : [{ type : Schema.Types.ObjectId, ref : 'CertificationType' }]//,
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
TrainerSchema.virtual('location.for_google_search').get(function () {
	var locationFull = "";
	if(this.location.google.placesAPI.formatted_address) {
		return this.location.google.placesAPI.formatted_address;
	}
	else {
		if(this.location.address1) {
			locationFull += this.location.address1;
		}
		if(this.location.city) {
			if(this.location.address1) {
				locationFull += ", "
			}
			locationFull += this.location.city;
		}
		if(this.location.state) {
			if(this.location.city) {
				locationFull += ", "
			}
			locationFull += this.location.state;
		}
		if(this.location.zipcode) {
			locationFull += " " + this.location.zipcode;
		}
	}
	return locationFull;
});
TrainerSchema.virtual('location.cityState').get(function () {
	return (this.location.city && this.location.state ) ? this.location.city + ", " + this.location.state : "Set Location";
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

		if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
			next(new Error('Invalid password'));
		else
			next();
	});

/**
 * Virtuals
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

TrainerSchema.path('locations')
.validate(function(locations){
		console.log("LOCATIONS:",locations);
		for(var i = 0; i < locations.length; i++) {
			var location = locations[i];
			console.log("Validating location", location);
			if(location.coords && (typeof location.coords.lat !== "undefined") && (typeof location.coords.lon !== "undefined")) {

			}
			else {
				return this.invalidate("location", "There was a problem processing your location");
			}
		}
	});
// Validate empty password
TrainerSchema
	.path('name.first')
	.validate(function(value) {
		if(this.name.first) {
			if(this.name.first.length < 3) {
				return this.invalidate('name', 'Please use a longer name');
			}
		}
	}, 'Name is not valid');

/**
 * Pre-save hook
 */
TrainerSchema
	.pre('save', function(next) {
		if (!this.isNew) return next();

		if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
			next(new Error('Invalid password'));
		else {
			this.alerts.profile.home = [
				{
					closed : false,
					type : "success",
					title : "Welcome to your Lunge profile!",
					sub : "Add more information about yourself and your expertise"
				},
				{
					closed : false,
					type : "info",
					template : '<div alert-convenient-url class="info"></div>'
				}
				/*,
				{
					closed : false,
					type : "info",
					title : "Welcome to your Lunge profile!",
					sub : "Add more information about yourself and your expertise"
				}
				*/
			]
			next();
		}
	});

// Validate email is not taken

TrainerSchema
	.path('email')
	.validate(function(value, respond) {
		var self = this;
		console.log("Attemping to validate trainer email: ", value);
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
		console.log("-------\n----------\n-ATTEMPTING TO CHANGE EMAIL TO:", value);
		if(!value) {
			return this.invalidate('email', 'Enter an email');
		}
		if(value.indexOf("@") == -1) {
			console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n!!!!!!!!!!!!!!!");
			return this.invalidate('email', 'Please use a real, valid email address');
		}
	}, 'The specified email address is already in use.');

// Validate email is not taken
TrainerSchema
	.path('location.zipcode')
	.validate(function(value) {
		var self = this;
		console.log("Attempting to validate zipcode:", value);
		if(!(/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value))) {
			return this.invalidate('zipcode', 'Please enter a valid zipcode');
		}
		return true;
	}, 'Invalid zipcode');

// Validate email is not taken
TrainerSchema
	.path('location.state')
	.validate(function(value) {
		console.log("Attempting to validate state:", value);
		if(value && (value != "MD" && value != "DC" && value != "VA")){
			console.log("INVALID USER STATE (not dc,md,va)");
			return this.invalidate('state', 'Lunge is not active in that state');
		}
		return true;
	}, 'Invalid state');

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
TrainerSchema.methods = {

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


module.exports = mongoose.model('Trainer', TrainerSchema);
TrainerSchema.plugin(autoIncrement.plugin, { model: 'Trainer', field: 'id' });