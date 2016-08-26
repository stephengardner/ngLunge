'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin'],
	autoIncrement = require('mongoose-auto-increment');

var ChatSchema = new Schema({
	started_by : {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'User'
	},
	chat_type : {
		type : String
	},
	messages : [
		{
			message : String,
			sent_at : Date,
			sender : {
				type : mongoose.Schema.Types.ObjectId,
				ref : 'User'
			},
			meta : [
				{
					user : {
						type : mongoose.Schema.Types.ObjectId,
						ref : 'User'
					},
					delivered : Boolean,
					read : Boolean
				}
			]
		}
	],
	is_group_message : { type : Boolean, default : false },
	participants : [
		{
			user : 	{
				type : mongoose.Schema.Types.ObjectId,
				ref : 'User'
			},
			delivered : Boolean,
			read : Boolean,
			notification : { type : Boolean, default : true }, // controls if the notification bubble pops up
			last_seen : Date
		}
	],
	last_message_sent_at : Date
},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	});
module.exports = function setup(options, imports, register) {
	var connectionDatabase = imports.connectionDatabase;
	var Model = connectionDatabase.model('Chat', ChatSchema);

	ChatSchema.plugin(autoIncrement.plugin, { model: 'Chat', field: 'id' });
	register(null, {
		chatModel : Model
	})
};
