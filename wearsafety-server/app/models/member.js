var config = require('../config/config');
var utils = require(config.root + '/app/helper/utils');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CreateUpdatedAt = require('mongoose-timestamp');


var MemberSchema = new Schema({    
	added_by :  { type : Schema.ObjectId, ref : 'User' },
	user_id:  {type : Schema.ObjectId, ref : 'User' }	
});

MemberSchema.plugin(CreateUpdatedAt);

module.exports = mongoose.model('Member', MemberSchema)
