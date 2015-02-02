var mongoose = require('mongoose');
var Member     = mongoose.model('Member');
var User     = mongoose.model('User');
var AccessToken     = mongoose.model('AccessToken');
var Schema = mongoose.Schema;


var config   = require('../../config/config');
var utils    = require(config.root + '/app/helper/utils');
var token_utils    = require(config.root + '/app/helper/token_utils');
var async    = require('async');
var moment      = require('moment');
var async = require('async');

var utility = require('utility');
var errorHelper = require(config.root + '/app/helper/errors');
var _ = require('lodash');



exports.create = function (req, res, next) {

   var token   = req.body.token;
   var user_id = req.body.user_id;
 
   AccessToken.findOne({token: token} , function(err,tok) {
  
  
   var message = req.body;
  
   var msg = token_utils.verify_access_token(tok);
  
  
   if(msg == 'valid') {
						
		if(!user_id){
        
		        var message     = req.body;
				message.status  = '401';
				message.message = "User is required";
		  
		return utils.responses(res, 401, message)
        }
		else{
			
			  device = new Device(req.body);
								
			  var message = new Object();
								
			  device.save(function(err) {
								
								  if(err){
								  
								   message.status  = '401';
								   message.message = "Error Tracking Device" 
                                   message.error   =  err;
  
								   return utils.responses(res, 200, message)
								  }
								  else{
								  
								  Device.findById(device, function (err, doc) {
								
                                   message.device	 =  doc;								
							   	   message.status    =  '200';
								   message.message   =  "Device Tracked successfully";
  
								   return utils.responses(res, 200, message)
								   
									})
									
								   
								   }
								});
						}
			  	  			  
		  }else{
		  
			message.status= '401';
			message.message = msg;
  
			return utils.responses(res, 401, message)
 
		  }
  })    
 
}


/** API to get list of all dependent devices **/

exports.list = function( req, res, next) {


  var token     = req.query.token;
  var user_id   = req.params.user_id;
  
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
 
  var msg = token_utils.verify_access_token(tok);
  
  
		 if(msg == 'valid') {
		  
			var condition = { _id : circle_id}
			  
			 
            Circle
				//.where(condition)
				.sort({createdAt: -1})
				.exec(function(err, circles) {
                             
               if(!circles){

			    return utils.message(res, 401, "No Devices Found");
                                
               }               
               else{
               
                       var mids = circles.map(function(doc) { return doc.members; });
                       
                                        
                            Member.where( {_id : {$in : mids }}).exec( function (err, doc) {
                                             
                            console.log(doc);
                            if(err) console.log(err);
                                             
                            var ids = doc.map(function(doc) { return doc.user_id; });
                                            
                                            
                            User.where({'_id' :  {$in : ids } }).exec( function(err,user) {
                             
                            var device_ids = user.map(function(doc) { return doc.device_id; });
                            
                            console.log(device_ids);
                            
                            if(device_ids.length == 0)
                                return utils.message(res, 401, "No Devices Found");
                            else
                                return utils.responses(res, 200, { devices: devices} ); 
                            })	                     
                            
                        })	                
                   }     
                
                });	    
                   		  
		  }else{
		  
			message.status= '401';
			message.message = msg;
  
			return utils.responses(res, 401, message)
 
		  }
  })    
}



