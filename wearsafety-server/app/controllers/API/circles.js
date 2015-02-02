var mongoose = require('mongoose');
var Member     = mongoose.model('Member');
var Circle     = mongoose.model('Circle');
var User     = mongoose.model('User');
var Schema = mongoose.Schema;

var AccessToken     = mongoose.model('AccessToken');
var config   = require('../../config/config');
var utils    = require(config.root + '/app/helper/utils');
var token_utils    = require(config.root + '/app/helper/token_utils');
var async    = require('async');
var jwt      = require('jwt-simple');
var moment      = require('moment');
var async = require('async');

var utility = require('utility');
var crypto = require('crypto');
var errorHelper = require(config.root + '/app/helper/errors');
var Mailer   = require(config.root + '/app/helper/mailer');
var _ = require('lodash');


exports.details = function( req, res, next) {


  var token   = req.query.token;
  var user_id = req.query.user_id;
  var _id     = req.params.id;
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
  
  var msg = token_utils.verify_access_token(tok);
  
  //console.log(msg);
  
		 if(msg == 'valid') {
		  
			  var condition = { _id : _id}
			  
			  
			  Circle
				.where(condition)
				.sort({createdAt: -1})
				.exec(function(err, circles) {

                 var jcircles = circles[0].toObject();
                 
                 if(!circles)
                    return
                    
				                
                                 Member.where( {_id : {$in : circles[0].members }}).exec( function (err, doc) {
                                     
                                     if(err) console.log(err);
                                     
                                    var ids = doc.map(function(doc) { return doc.user_id; });
                                    
                                    
                                     User.where({'_id' :  {$in : ids } }).exec( function(err,user) {
                                        
                                        jcircles.members = user;
                                       
                                        console.log(err);
                                         
                                        if(err) return utils.responses(res, 500, err)  
  
                                        return utils.responses(res, 200, { circles: jcircles} );
                                                                           
                                });          
                                
                                    
                                
                              });
                 
               
				})		  			  
		  }else{
		  
			message.status= '401';
			message.message = msg;
  
			return utils.responses(res, 401, message)
 
		  }
  })    
}




exports.create = function (req, res, next) {

  var token = req.body.token;
  var user_id = req.body.user_id;
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
  var msg = token_utils.verify_access_token(tok);
  
  
  
		 if(msg == 'valid') {
			   
						
						if(!user_id){
						
						        var message = req.body;
								message.status= '401';
								message.message = "User is required";
		  
								return utils.responses(res, 401, message)
						}
						else{
			
			                    circle             = new Circle(req.body);
								
								var message = new Object();
								
								circle.save(function(err) {
								
								  if(err){
								  
								   message.status= '401';
								   message.message = "Error Creating circle" 
                                   message.error   = err;
  
								   return utils.responses(res, 200, message)
								  }
								  else{
								  
								  Circle.findById(circle, function (err, doc) {
								
                                   message.circle	 = doc;								
							   	   message.status= '200';
								   message.message = "Circle created successfully";
  
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

exports.add_member = function (req, res, next) {

  var token           = req.body.token;
  var circle_id       = req.body.circle_id;
  var user_id         = req.body.user_id;
  
  var email           = req.body.email;
  var first_name      = req.body.first_name;
  var last_name       = req.body.first_name;
  var profile_photo   = req.files.profile_photo;
  
  var device_id       = req.body.device_id;
  var mobile          = req.body.mobile;
  var city            = req.body.city;
  var country         = req.body.country;
   
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = new Object();
  
  var msg = token_utils.verify_access_token(tok);
  
  
		 if(msg == 'valid') {
		  
		            Circle.findOne({ _id : _id}, function(err,circle) {
			   		
				    
                    if(!circle){
                                message.status= '401';
								message.message = "Circle not found";
								message.detail = err;
								return utils.responses(res, 401, message)
                    
                    }
					
                    else {
						
                        
                         async.waterfall([
                         
                                function(next) {
                                  crypto.randomBytes(16, function(err, buf) {
                                    var token = buf.toString('hex');
                                    next(err, token);
                                  });
                                },
                                function(token, next) {
                                    
                                    var user = new User();
                                    
                                    if(email){
                                        user.email = req.body.email;
                                        user.invitation_token = token;
                                        user.invitation_expires = Date.now() + 43200000; // 12 hour
                                        user.mode = 'invite';
                                    }
                                    else{
                                    
                                    user.profile_photo.file = profile_photo;
                                    user.first_name = first_name;
                                    user.last_name = last_name;
                                    user.city = city;
                                    user.country = country;
                                    user.device_id = device_id;
                                    user.mobile    = mobile;
                                    }
                                    
                                    user.save(function(err) {
                                      next(err, token, user);
                                    });
                                    
                                }, function(token, user, next) {
                                
                                
                                var member = new Member({user_id : user._id, added_by : user_id});
                                  
                                 member.save(function (err, member) {
                                   
                                  
                                  circle.Members.addToSet (member._id );
                        
                                     circle.save(function (err, circle) {
                                               if(err){
                                                    message.status= '401';
                                                    message.message = "Error adding Member to circle";
                                                    message.detail = err;
                                                    return utils.responses(res, 401, message)
                                                }
                                                else{
                                                    
                                                    if(req.body.email){
                                                            user.url_invitation = req.protocol + '://' + req.headers.host + '/invite/' + token

                                                            Mailer.sendOne('invitation', "Wearable Safety - Invitation", user, function (err, responseStatus, html, text){
                                                              next(err, responseStatus);
                                                            })
                                                            
                                                            message.status= '200';
                                                            message.message = "Added Member to circle successfully";	
                                                            return utils.responses(res, 200, message)
                                                    }
                                                    else
                                                    {
                                                            message.status= '200';
                                                            message.message = "Added Member to circle successfully";	
                                                            return utils.responses(res, 200, message)
                                                    }
                                                
                                                }
                                        });
                                    
                                    });
                                
                                   }
                                ], function(err) {
                                      if (err) {
                                      
                                      var message = req.body;
                                          message.status = '500';
                                          message.message = 'Failed sending invitation. please try again later. ' + err;
                                          
                                          return utils.responses(res, 200, message)
                                        
                                      }
                                 
                                });
                                
                       
                        
                        
					}
                    
						
                    
                    
			    });
		  }else{
		  
			message.status= '401';
			message.message = msg;
  
			return utils.responses(res, 401, message)
 
		  }
  })    
 
}

