'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
var crypto = require('crypto');

var authTypes = ['email'];

var LungerScheme = new Schema(
	{
		id : { type : Number },
		email : { type : String, unique : true },
		name : { first : {type : String, required : false}, last : {type : String, required : false} },
		location: { city : {type : String, required : false}, state : {type : String, required : false}, zip : {type : Number, required : false} },
		active: {type : Boolean, default : 1},
		rating : {type : Number, default : 0},
		profile_picture : {high_resolution : {url : {type : String}}, medium_resolution : {url : {type : String}}, thumbnail : {url : {type : String}}},
		type : String,
		salt : String,
		role: {
			type: String,
			default: 'trainer'
		},
		hashedPassword : String,
		verified: { type : Boolean, default : false },
		provider : { type : String }
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	}
);

var validatePresenceOf = function(value) {
	return value && value.length;
};

LungerScheme.virtual('name.full').get(function () {
	return this.name.first + ' ' + this.name.last;
});


/**
 * Pre-save hook
 */
LungerScheme
	.pre('save', function(next) {
		if (!this.isNew) return next();

		if (this.registration && this.registration.verified && !validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
			next(new Error('Invalid password'));
		else
			next();
	});


/**
 * Virtuals
 */
LungerScheme
	.virtual('password')
	.set(function(password) {
		this._password = password;
		this.salt = this.makeSalt();
		this.hashedPassword = this.encryptPassword(password);
	})
	.get(function() {
		return this._password;
	});

// Validate email is not taken
LungerScheme
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
/**
 * Methods
 */
LungerScheme.methods = {
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


module.exports = mongoose.model('Lunger', LungerScheme);
LungerScheme.plugin(autoIncrement.plugin, { model: 'Lunger', field: 'id' });