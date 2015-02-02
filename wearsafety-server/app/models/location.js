var config = require('../config/config');
var utils = require(config.root + '/app/helper/utils');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CreateUpdatedAt = require('mongoose-timestamp');



var LocationSchema = new Schema({
    device_id: {
      type: String,
      required: true     
    },
    gps_timestamp :{ type : Number},
    gps_latitude  :{ type : Number},
    gps_longitude :{ type : Number},
    gps_speed     :{ type : Number},
    gps_heading   :{ type : Number},
    provider      :{ type : String},
    time_interval :{ type : Number},
    distance_interval :{ type : Number}
    
});



LocationSchema.plugin(CreateUpdatedAt);


module.exports = mongoose.model('Location', LocationSchema)
