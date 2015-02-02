
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema
var CreateUpdatedAt = require('mongoose-timestamp');
var path = require('path')
var _ = require('lodash');

/**
 * User Schema
 */
var schemaOptions = {
    toObject: {
      virtuals: true
    }
    ,toJSON: {
      virtuals: true
    }
  };
  
var CustomerSchema = new Schema({
  email: {
    type: String,
    require: true,
    lowercase: true
  },
  first_name:    String,
  last_name:     String,
 
  city:          String,
  state:         String,
  country:       String,
  zip:           Number,
  mobile:        Number,
  
  order_number     : String,
  order_tax        : Number,
  order_ship       : Number,
  order_quantity   : Number,
  order_price      : Number,
  order_color      : String,
  
  
  mihpayid         : String,
  bank_ref_num     : String,
  bank_code        : String,
  name_on_card     : String,
  cardnum          : String,
  pay_status       : String,
  net_amount_debit : String,
  mode             : String
  
},schemaOptions)

CustomerSchema.plugin(CreateUpdatedAt)

var LeadSchema = new Schema({
  email: {
    type: String,
    lowercase: true
  },
  name:    String,
  message:       String,
  city:          String,
  state:         String,
  country:       String,
  phone:        Number
  
  
},schemaOptions)

LeadSchema.plugin(CreateUpdatedAt)

var ReviewSchema = new Schema({
  comment:    String,
  rating :    String
},schemaOptions)

ReviewSchema.plugin(CreateUpdatedAt)




module.exports = mongoose.model('Customer', CustomerSchema)
module.exports = mongoose.model('Lead', LeadSchema)
module.exports = mongoose.model('Review', ReviewSchema)
