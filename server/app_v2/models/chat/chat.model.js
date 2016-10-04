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
	to_self : Boolean,
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
					read : Boolean,
					seen_at : Date
					// is_most_recent_seen_message : Boolean // helper that just keeps track which "Seen 10:56pm" tag
					// to show, for which message
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
			notification : { type : Boolean, default : true }, // controls if the notification bubble pops up
			
			// Seen, seen_at, and last_message.seen, last_message.seen_at are the SAME THING...  Just FYI
			seen : Boolean,
			seen_at : Date,
			final_message : {
				seen : Boolean,
				seen_at : Date
			},
			last_message_sent_at : Date,
			// these are different, "last message seen" is the message that the user has seen most recently
			//  "most recent message seen" is the most recently sent message that the user has now seen
			id_of_last_message_seen : String,
			sent_time_of_most_recent_message_seen : Date,
			id_of_most_recent_message_seen : String
		}
	],
		last_message_sent_at : Date,
		last_message_sent_by : {
			type : mongoose.Schema.Types.ObjectId,
			ref : 'User'
		}
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
