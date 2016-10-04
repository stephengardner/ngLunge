'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	autoIncrement = require('mongoose-auto-increment');

var ReviewSchema= new Schema({
		from : {
			type : Schema.Types.ObjectId, ref : 'User'
		},
		to : {
			type : Schema.Types.ObjectId, ref : 'User'
		},
		thanked_by : [{
			type : Schema.Types.ObjectId, ref : 'User'
		}],
		deleted : Boolean,
		created_at : Date,
		edited_at : Date,
		rating_overall : Number,
		text_overall : String,
		recommended : Boolean,
		past_edits : [
			{
				created_at: Date,
				rating_overall : Number,
				text_overall : String,
				recommended : Boolean
			}
		]
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
	});
module.exports = function setup(options, imports, register) {
	var connectionDatabase = imports.connectionDatabase;
	var Model = connectionDatabase.model('Review', ReviewSchema);

	ReviewSchema.plugin(autoIncrement.plugin, { model: 'Review', field: 'id' });
	register(null, {
		reviewModel : Model
	})
};
