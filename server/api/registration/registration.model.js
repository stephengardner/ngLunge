'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');
var Trainer = require('../trainer/trainer.model');
var validator = require("email-validator");

var RegistrationSchema = new Schema({
		id : { type : Number },
		authenticationHash : { type : String },
		email : { type : String/*, unique : true*/ },
		authenticated : { type : Boolean, default : false },
		name : { first : {type : String, required : false}, last : {type : String, required : false} },
		location: { city : {type : String, required : false}, state : {type : String, required : false}, zip : {type : Number, required : false} },
		active: {type : Boolean, default : 1},
		profile_picture : {url : {type : String}},
		type : String,
		userCreated : false,
		verified : false
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	});


var authTypes = ['github', 'twitter', 'facebook', 'google'];

// Validate empty email
RegistrationSchema
	.path('email')
	.validate(function(email) {
		console.log("Attempting to validate email: ", email);
		if (authTypes.indexOf(this.provider) !== -1) return true;
		return email.length;
	}, 'Email cannot be blank');

/*
RegistrationSchema
	.path('password')
	.validate(function(email) {
		console.log("Attempting to validate email: ", email);
		if (authTypes.indexOf(this.provider) !== -1) return true;
		return email.length;
	}, 'Email cannot be blank');
	*/

RegistrationSchema
	.path('email')
	.validate(function(value, respond) {
		var self = this;
		this.constructor.findOne({email: value}, function(err, registration) {
			if(err) throw err;
			if(registration){
				if(self.id === registration.id) return respond(true);
				else{
					return respond(false);
				}
			}
			respond(true);
		});
	}, 'We\'ve already sent your validation link.');


RegistrationSchema
	.path('email')
	.validate(function(value, respond) {
		var self = this;
		Trainer.findOne({email: value}, function(err, trainer) {
			if(err) throw err;
			if(trainer) {
				return respond(false);
			}
			respond(true);
		});
	}, 'That email has already been registered.');

RegistrationSchema
	.path('email')
	.validate(function(value, respond) {
		if(validator.validate(value)) {
			return respond(true);
		}
		respond(false);
	}, 'Please use a real, valid email address.');

RegistrationSchema.virtual('name.full').get(function () {
	return this.name.first + ' ' + this.name.last;
});
module.exports = mongoose.model('Registration', RegistrationSchema);
RegistrationSchema.plugin(autoIncrement.plugin, { model: 'Registration', field: 'id' });