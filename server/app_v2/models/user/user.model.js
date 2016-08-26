'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin'],
	autoIncrement = require('mongoose-auto-increment'),
	validator = require('validator')
;

var options = {
	discriminatorKey : 'kind',
	toObject: { virtuals: true },
	toJSON: { virtuals: true }
};
var UserSchema = new Schema({
		picture : { type : String, default : "none"},
		name: { first : String, last : String },
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
		work : {
			places : [
				{
					position : { type : String },
					company_name : { type : String },
					website : { type : String },
					title : { type : String } // user given title
				}
			],
			privacy : { type : String, default : 'public' }
		},
		bio : { type : String, required : false },
		id : {type : Number},
		email: { type: String, lowercase: true },
		role: {
			type: String,
			default: 'user'
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
	reviews : {
		given : [
			{
				to : {
					type : Schema.Types.ObjectId, ref : 'User'
				}
			}
		],
		received : [
			{
				from :
				{
					type : Schema.Types.ObjectId, ref : 'User'
				}
			}
		]
	},
		urlName : String,
		hashedPassword: String,
		provider: String,
		salt: String,
		registration_providers : {
			facebook: {},
			linkedin : {}
		},
		facebook: {},
		twitter: {},
		google: {},
		linkedin : {},
		github: {},
		notifications : {
			count : {
				chat : {
					type : Number,
					default : 0
				}
			}
		},
		chat : [
			{
				type : Schema.Types.ObjectId, ref : 'Chat'
			}
		],
		profile_picture : {
			high_resolution : {
				url : {
					type : String
				}
			},
			medium_resolution : {
				url : {
					type : String
				}
			},
			thumbnail : {
				url : {
					type : String,
					// default : "/assets/images/default-profile-picture.jpg"
				}
			}
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
	},
	options);
// When saving a trainer, set their initial urlName to be their email address
// if someone else has already used that email address for a different domain,
// ex: augdog@gmail vs augdog@yahoo, then append a "-2" onto the end of the name.
// or, append a -# (where # is the next number in the sequence), if there are more than two (highly unlikely).
UserSchema
	.pre('save', function(next) {
		console.log("!!!!!!!!!!!!HEEEEEEEEEEEEEEEYYYYYYYYYYYYYYYYYY\n\n\n");
		if (this.urlName || !this.email) return next();
		var newUrlName = this.email.split("@");
		newUrlName = newUrlName[0];
		var self = this;
		var emailSplit = self.email.split("@");
		emailSplit = emailSplit[0];
		console.log("Attempting to find urlname:", emailSplit);
		this.constructor.find({}).exec(function(err, found){
			console.log("ALLLLLLLLLLLLLLLL?", found.length);
			this.constructor
				.find({
					urlName: new RegExp(emailSplit, "i")
				}).sort({urlName : -1 }).exec(function(err, trainer) {
				console.log("Did we find any?!?!?!?!?!", trainer);
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
		}.bind(this))
	});

/**
 * Virtuals
 */
UserSchema
	.virtual('password')
	.set(function(password) {
		this._password = password;
		this.salt = this.makeSalt();
		this.hashedPassword = this.encryptPassword(password);
		this
	})
	.get(function() {
		return this._password;
	});

UserSchema.virtual('name.full').get(function () {
	if(this.name.last && this.name.first) {
		return this.name.first + ' ' + this.name.last;
	}
	else if(this.name.first) {
		return this.name.first;
	}
	else
		return this.name.last;
}).set(function(fullName) {
	var regexp = /^[a-zA-Z- ]+$/;
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
// Public profile information
UserSchema
	.virtual('profile')
	.get(function() {
		return {
			'name': this.name,
			'role': this.role
		};
	});

// Non-sensitive info we'll be putting in the token
UserSchema
	.virtual('token')
	.get(function() {
		return {
			'_id': this._id,
			'role': this.role
		};
	});

/**
 * Validations
 */

// Validate empty email
UserSchema
	.path('email')
	.validate(function(email) {
		if (authTypes.indexOf(this.provider) !== -1) return true;
		return email && email.length;
	}, 'Email cannot be blank');

// Validate empty email
UserSchema
	.path('work.places')
	.validate(function(workplaces) {
		console.log("Workplaces:", workplaces);
		if(!workplaces || !workplaces.length) {
			return;
		}
		workplaces.forEach(function(item){
			if(item.position && item.position.length > 50) {
				return this.invalidate('position', 'Job title must be less than 50 characters');
			}
			if(item.company_name && item.company_name.length > 50) {
				return this.invalidate('companyName', 'Company name must be less than 50 characters');
			}
			if(item.website && !validator.isURL(item.website, {
					require_protocol : true
				})) {
				return this.invalidate('website', 'Company website must be a valid URL');
			}
		}.bind(this));
		return true;
	}, 'Workplace error');

// Validate empty password
UserSchema
	.path('hashedPassword')
	.validate(function(hashedPassword, respond) {
		if (authTypes.indexOf(this.provider) !== -1) return true;
		console.log("Validating hashed pass:", hashedPassword);
		console.log("THIS PASS:", this._password);
		if(!hashedPassword) {
			this.invalidate('password', 'Password cannot be blank');
			return respond(false);
		}
		else if(this._password && this._password.length < 6) {
			this.invalidate('password', 'Password must be at least 6 characters');
			return respond(false);
		}
		return respond(true);
	}, 'Password cannot be blank');

// Validate email is not taken
// not used right now since passport authentication can have
// one email assigned to multiple providers.
// for example, facebook and linkedin could use the same email
// in the future, perhaps auto-combine these into one user!
// DO NOT DELETE, see ABOVE before deleting!
UserSchema
	.path('email')
	.validate(function(value, respond) {
		var self = this;
		this.constructor.findOne({email: value}, function(err, user) {
			if(err) throw err;
			if(user) {
				if(self.id === user.id) return respond(true);
				// dynamically show the user that this email is in the error message
				self.invalidate('email', value + ' is already signed up!');
				return respond(false);
			}
			respond(true);
		});
	}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
	return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
	.pre('save', function(next) {
		if (!this.isNew) return next();
		for(let type of authTypes) {
			if(this.registration_providers[type]) {
				return next();
			}
		}
		if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
			next(new Error('Invalid password'));
		else
			next();
	});

/**
 * Methods
 */
UserSchema.methods = {
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

module.exports = function setup(options, imports, register) {
	var connectionDatabase = imports.connectionDatabase;
	var Model = connectionDatabase.model('User', UserSchema);
	// Model.collection.dropIndex("email_1", function(err, dropped){
	// 	console.log("Dropped?", dropped)
	// });
	// Model.collection.dropIndex("email", function(err, dropped){
	// 	console.log("Dropped?", dropped)
	// });
	UserSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'id' });
	register(null, {
		userModel : Model
	})
};
