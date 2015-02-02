var mongoose = require('mongoose');
var Member     = mongoose.model('Member');
var User     = mongoose.model('User');
var Circle     = mongoose.model('Circle');
var Location     = mongoose.model('Location');

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

var eventsEmitter = require(config.root + "/app/middleware/events");

//Array to store all connected clients

exports.list = function( req, res, next) {


  var token     = req.query.token;
  var circle_id = req.params.circle_id;
  
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
 
  
  var msg = token_utils.verify_access_token(tok);
  
  
		 if(msg == 'valid') {
		  
			var condition = { _id : circle_id}
			  		 
            Circle
				.where(condition)
				.sort({createdAt: -1})
				.exec(function(err, circles) {
                             
               if(!circles[0]){

			    return utils.message(res, 401, "Circle Not Found");
                                
               }               
               else{
                       var jcircles = circles[0].toObject();
                         
                         if(!circles[0].members)
                             return utils.message(res, 401, "No Members Found in this circle");
                            
                                        
                            Member.where( {_id : {$in : circles[0].members }}).exec( function (err, doc) {
                                             
                            //console.log(doc);
                            //if(err) console.log(err);
                                             
                            var ids = doc.map(function(doc) { return doc.user_id; });
                                            
                                            
                            User.where({'_id' :  {$in : ids } }).exec( function(err,user) {
                             
                            var device_ids = user.map(function(doc) { return doc.device_id; });
                            
                            console.log(device_ids);
                            
                            if(device_ids.length == 0)
                                return utils.message(res, 401, "No Devices Found");
                            
                            var c = 
                            [
                             { $sort: {createdAt: -1 } },
                                 {
                                   $group:
                                     {
                                       _id: "$device_id",
                                       date: { $first: "$createdAt" },
                                       gps_latitude: { $first:"$gps_latitude"},
                                       gps_longitude: { $first:"$gps_longitude"},
                                       gps_timestamp: { $first:"$gps_timestamp"},
                                       gps_speed:{ $first: "$gps_speed"}
                                     }
                                 }
                            ];
                             
                         
                             Location
                               .aggregate(c,function(err, locations) {
                                        
                                       // console.log(err);
                                        
                                        if(!locations){
                                            utils.message(res,401,"No Location data found for this device");
                                        }else{ 
                                        
                                       // console.log(result);
                                        //console.log(locations);
                                        
                                            var members=[];
                                            for(var i = 0; i < device_ids.length; i++){
                                                var member = new Object();
                                                var m = _.where(user, {device_id: device_ids[i]} );
                                                var l = _.where(locations, {_id: device_ids[i]} );
                                                member.member = m.length >  0 ? m[0] : m;
                                                member.location = l.length > 0 ? l[0] : l;
                                                members.push(member);
                                            }
                                            return utils.responses(res, 200, { members: members} );
                                        }
                                         
                                });
                              
                            
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


exports.clientcom = function(user_id){

			var condition = { _id : circle_id}
			  
			 
            Circle
				.where(condition)
				.sort({createdAt: -1})
				.exec(function(err, circles) {
                             
               if(!circles[0]){

			    return utils.message(res, 401, "Circle Not Found");
                                
               }               
               else{
                       var jcircles = circles[0].toObject();
                         
                         if(!circles[0].members)
                             return utils.message(res, 401, "No Members Found in this circle");
                            
                                        
                            Member.where( {_id : {$in : circles[0].members }}).exec( function (err, doc) {
                                             
                            //console.log(doc);
                            //if(err) console.log(err);
                                             
                            var ids = doc.map(function(doc) { return doc.user_id; });
                                            
                                            
                            User.where({'_id' :  {$in : ids } }).exec( function(err,user) {
                             
                            var device_ids = user.map(function(doc) { return doc.device_id; });
                            
                            console.log(device_ids);
                            
                            if(device_ids.length == 0)
                                return utils.message(res, 401, "No Devices Found");
                            
                            var c = 
                            [
                             { $sort: {createdAt: -1 } },
                                 {
                                   $group:
                                     {
                                       _id: "$device_id",
                                       date: { $first: "$createdAt" },
                                       gps_latitude: { $first:"$gps_latitude"},
                                       gps_longitude: { $first:"$gps_longitude"},
                                       gps_timestamp: { $first:"$gps_timestamp"},
                                       gps_speed:{ $first: "$gps_speed"}
                                     }
                                 }
                            ];
                             
                         
                             Location
                               .aggregate(c,function(err, locations) {
                                        
                                       // console.log(err);
                                        
                                        if(!locations){
                                            utils.message(res,401,"No Location data found for this device");
                                        }else{ 
                                        
                                       // console.log(result);
                                        //console.log(locations);
                                        
                                            var members=[];
                                            for(var i = 0; i < device_ids.length; i++){
                                                var member = new Object();
                                                var m = _.where(user, {device_id: device_ids[i]} );
                                                var l = _.where(locations, {_id: device_ids[i]} );
                                                member.member = m;
                                                member.location = l;
                                                members.push(member);
                                            }
                                            return utils.responses(res, 200, { members: members} );
                                        }
                                         
                                });
                              
                            
                            })	                     
                            
                        })	                
                   }     
                
                });	   

}

exports.create = function (req, res, next) {

  var token     = req.body.token;
  var device_id = req.body.device_id;
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
  var msg = token_utils.verify_access_token(tok);
  
  
  
		 if(msg == 'valid') {
			   
						
						if(!device_id){
						
						        var message = req.body;
								message.status= '401';
								message.message = "Device Identifier is required";
		  
								return utils.responses(res, 401, message)
						}
						else{
			
			                    location  = new Location(req.body);
								
								var message = new Object();
								
								location.save(function(err) {
								
								  if(err){
								  
								   message.status= '401';
								   message.message = "Error Creating Location" 
                                   message.error   = err;
  
								   return utils.responses(res, 200, message)
								  }
								  else{
								  
								  Location.findById(location, function (err, doc) {
								
                                   message.location	 = doc;								
							   	   message.status= '200';
								   message.message = "Location Tracked successfully";
                                   
                                   User.where({'device_id' :  device_id }).exec( function(err,user) {
                                    
                                      var members = [];
                                      var member = new Object();
                                      member.member = user;
                                      member.location = location;
                                      members.push(member);
                                                
                                      eventsEmitter.emit('location',members);
                                      
                                      });
  
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
