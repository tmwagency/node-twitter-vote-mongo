
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Schema = mongoose.Schema;

/**
 * QDT Schema
 */

var StateSchema = new Schema({
	question				:	{	type : Schema.ObjectId, ref : 'Question'		},
	date					:	{	type : Date, default : Date.now					},

	tags					:	[{
		tag					:	{	type : String, default : '', trim : true		},
		votes				:	{	type : Number, default : 0						},
		percentage			:	{	type : Number, default : 0						}
	}],
	totalVotes				:	{	type : Number, default : 0						}
});


/**
 * Methods
 */

StateSchema.methods = {


}



/**
 * Statics
 */

StateSchema.statics = {

	/**
	* Find State by DB id, Tag and date
	*
	* @param {ObjectId} _id
	* @param {Function} cb
	* @api private
	*/

	load: function (qID, dateRange, cb) {

		if (dateRange === 'today') {
			var now = new Date(),
				today = new Date(now.getFullYear(), now.getMonth(), now.getDate());


			this.findOne({
				question : qID,
				date: today
			})
				.exec(cb);
		}

	},


	/**
	* Return a global state for all questions active today
	*
	* @param {Function} cb
	* @api private
	*/

	loadGlobalState: function (cb) {

		var now = new Date(),
			today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		// this.find({
		// 	date: today
		// }, function (err, states) { console.log(states)});

		this.find({
			date: today
		})
			.populate('question')
			.exec(cb);

	}

}

mongoose.model('State', StateSchema);
