var config = require('../config/config');
var utils = require(config.root + '/app/helper/utils');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CreateUpdatedAt = require('mongoose-timestamp');


var CircleSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    type: String,
	user_id:     { type : Schema.ObjectId,     ref : 'User' },
	description: { type: String },
    members:     [{ type : Schema.ObjectId,  ref : 'Member', unique: true }],
    tags:        [{type: String}],    
    is_active:    { type: Boolean, default: true },  
    default_flag :{ type: Boolean, default: true }   
});

CircleSchema.index ({ name: 1, user_id: 1 }, {unique: true})

CircleSchema.plugin(CreateUpdatedAt);

module.exports = mongoose.model('Circle', CircleSchema)