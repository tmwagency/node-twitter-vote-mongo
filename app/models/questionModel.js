
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , env = process.env.NODE_ENV || 'development'
  , config = require('../../config/config')[env]
  , Schema = mongoose.Schema;


/**
 * Getters
 */

var getTags = function (tags) {
  return tags;
}

/**
 * Setters
 */

var setTags = function (tags) {
  return tags.split(',')
}


/**
 * Question Schema
 */

var QuestionSchema = new Schema({
	questionURL			:	{	type : String, default : '', trim : true	},
	title				:	{	type : String, default : '', trim : true	},
	subtitle			:	{	type : String, default : '', trim : true	},
	watchForNonHashTags	:	{	type : Boolean								},
	createdOn			:	{	type : Date, default : Date.now				},
	lastUpdated			:	{	type : Date, default : Date.now				},

	tags				:	{	type: [String], get: getTags, set: setTags		},

	twitterText			:	{	type : String, default : '', trim : true	},
	fbText				:	{	type : String, default : '', trim : true	},

	isActive			:	{	type : Boolean, default : true				}
});


/**
 * Methods
 */

QuestionSchema.methods = {



};



/**
 * Statics
 */

QuestionSchema.statics = {

  /**
   * Find question by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

	load: function (id, cb) {
		this.findOne({ questionURL : id })
			.exec(cb);
	},

	/**
	* Find all questions
	*
	* @param {Function} cb
	* @api private
	*/

	loadAll: function (cb) {

		this.find({ isActive : true }).sort({createdOn: -1})
			.exec(cb);

	},

  /**
   * Find all hashtags
   *
   * @param {Function} cb
   * @api private
   */

	getAllTags: function (cb) {

		var tags = [];

		this.find({ isActive : true }, { tags: 1, watchForNonHashTags: 1 }, function (err, questions) {
			if (err) return handleError(err);
			questions.forEach(function (q) {
				for (var i = 0; i < q.tags.length; i++) {

					var tag = q.tags[i];

					//add in exception for certain questions
					//THIS SHOULD ONLY BE TEMPORARY UNTIL I WRITE IT TO WORK WITH AN ARRAY OF SEARCH TERMS!
					switch (tag.toLowerCase()) {

						//Xfactor lookup for full names
						case '#lukefriendmusic':
							tag = 'luke friend';
							break;
						case '#sambaileyreal':
							tag = 'sam bailey';
							break;
						case '#nickymcdonald1':
							tag = 'nicky mcdonald';
							break;

					}

					tags.push(tag);

					if (q.watchForNonHashTags === true) {

						var nonHashedTag = q.tags[i].substr(1);






					//add in exception for certain questions
						switch (nonHashedTag.toLowerCase()) {
							//so xboxone should be xbox one
							case 'xboxone':
								nonHashedTag = nonHashedTag.substr(0, 4) + ' ' + nonHashedTag.substr(4);
								break;

						}


						tags.push(nonHashedTag);
					}

				}
			});

			cb(tags);
		});

	}

};

mongoose.model('Question', QuestionSchema);
