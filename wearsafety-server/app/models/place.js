var config = require('../config/config');
var utils = require(config.root + '/app/helper/utils');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CreateUpdatedAt = require('mongoose-timestamp');


var PlaceSchema = new Schema({    
	name          :  { type : String},
    description   :  { type : String},
    gps_longitude :  { type : Number},
    gps_latitude  :  { type : Number},
    gps_radius    :  { type : Number},
    gps_address   :  { type : String},
    ptype         :  { type : String},
	user_id       :  { type : Schema.ObjectId, ref : 'User' }	
});

PlaceSchema.plugin(CreateUpdatedAt);

module.exports = mongoose.model('Place', PlaceSchema)
