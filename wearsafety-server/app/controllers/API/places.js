var mongoose = require('mongoose');
var Member     = mongoose.model('Member');
var User     = mongoose.model('User');
var Circle     = mongoose.model('Circle');
var Location     = mongoose.model('Location');
var Place     = mongoose.model('Place');
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




exports.list = function( req, res, next) {


  var token     = req.query.token;
  var user_id   = req.query.user_id;
  var type      = req.query.type;
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
 
  
  var msg = token_utils.verify_access_token(tok);
  
  
		 if(msg == 'valid') {
		  
			var condition = {
					$and: [
							{ user_id : user_id },						    
							{type: type}								

						  ]
				}  
			 
            Place
				.where(condition)
				.sort({createdAt: -1})
				.exec(function(err, places) {
                             
               if(!places[0]){

			    return utils.message(res, 401, "No Places Found");
                                
               }               
               else{
                        return utils.responses(res, 200, { places: places} );
                         
                    }    	                     
                            
                });	    
                   
			 	  			  
		  }else{
		  
			message.status= '401';
			message.message = msg;
  
			return utils.responses(res, 401, message)
 
		  }
  })    
}


exports.create = function (req, res, next) {

  var token     = req.body.token;
  var user_id = req.body.user_id;
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
  var msg = token_utils.verify_access_token(tok);
  
  
  
		 if(msg == 'valid') {
			   
						
						if(!user_id){
						
						        var message = req.body;
								message.status= '401';
								message.message = "User Identifier is required";
		  
								return utils.responses(res, 401, message)
						}
						else{
			
			                    place  = new Place(req.body);
								
								var message = new Object();
								
								place.save(function(err) {
								
								  if(err){
								  
								   message.status= '401';
								   message.message = "Error Creating Place" 
                                   message.error   = err;
  
								   return utils.responses(res, 200, message)
								  }
								  else{
								  
								  Place.findById(place, function (err, doc) {
								
                                   message.place	 = doc;								
							   	   message.status= '200';
								   message.message = "Place Created successfully";
  
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
