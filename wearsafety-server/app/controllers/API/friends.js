var mongoose = require('mongoose');
var Friend     = mongoose.model('Friend');
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



exports.list = function( req, res, next) {


  var token = req.query.token;
  var user_id = req.query.user_id;
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
  var msg = token_utils.verify_access_token(tok);
  
  //console.log(msg);
  
		 if(msg == 'valid') {
		  
			  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
			  var perPage = 14;
			  var options = {
				perPage: perPage,
				page: page
			  };

			  console.log(user_id);
			 
			  var condition = { referred_by : user_id}
			  
			   
			  Friend
				.where(condition)
				.sort({createdAt: -1})
				.skip(options.perPage * options.page)
				.limit(options.perPage)
				.exec(function(err, friends) {

				  if(err) return utils.responses(res, 500, err)

				  Friend.count(condition, function (err, count) {

					if (err) return errorHelper.mongoose(res, err);

					return utils.responses(res, 200, { friends: friends, count: count} );

				  });
				})		  			  
		  }else{
		  
			message.status= '401';
			message.message = msg;
  
			return utils.responses(res, 401, message)
 
		  }
  })    
}


exports.details = function( req, res, next) {


  var token = req.query.token;
  
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = new Object();
  var _id = req.params.id;
  
  var msg = token_utils.verify_access_token(tok);
  
  //console.log(msg);
  
		 if(msg == 'valid') {
		  
			  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
			  var perPage = 14;
			  var options = {
				perPage: perPage,
				page: page
			  };

			 // console.log(user_id);
			 
			  var condition = { _id : _id}
			  
			   
			  Friend
				.where(condition)
				.sort({createdAt: -1})
				.skip(options.perPage * options.page)
				.limit(options.perPage)
				.exec(function(err, friends) {

				  if(err) return utils.responses(res, 500, err)

				  Friend.count(condition, function (err, count) {

					if (err) return errorHelper.mongoose(res, err);

					return utils.responses(res, 200, { friends: friends, count: count} );

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

  var email = req.body.email;

  var token = req.body.token;
  var user_id = req.body.user_id;
 
  AccessToken.findOne({token: token} , function(err,tok) {
  
  
  var message = req.body;
  
  var msg = token_utils.verify_access_token(tok);
  
  //console.log(msg);
  
		 if(msg == 'valid') {
		  
		    if(!user_id){
						
			   var message = req.body;
				message.status= '401';
			    message.message = "User is required";
		  		return utils.responses(res, 401, message)
			}
            
             if(email)
                    {
                    //search for users with email and create a friend and add to circle.
                    
                         User.findOne({ email : email}, function(err,user) {
                            
                           if(user){
                            
                            var friend = new Friend({user_id: user._id, email: email, referred_by : circle.user_id , status_flag : 'P'});
                                
                                friend.save(function(err) {
                                  console.log(err);
                                  
                                   Friend.findById(friend, function (err, doc) {
                                   
                                          circle.friends.addToSet (friend._id );
                                          
                                           circle.save(function (err, circle) {
                                               if(err){
                                                    message.status= '401';
                                                    message.message = "Error adding friend to circle";
                                                    message.detail = err;
                                                    return utils.responses(res, 401, message)
                                                }
                                                else{
                                                    message.status= '200';
                                                    message.message = "Added friend to circle successfully";	
                                                    return utils.responses(res, 200, message)
                                                }
                                                
                                            });
                        
                                    });
                                });
                                
                            }
                            else
                            {
                            
                              async.waterfall([
                                function(next) {
                                  crypto.randomBytes(16, function(err, buf) {
                                    var token = buf.toString('hex');
                                    next(err, token);
                                  });
                                },
                                function(token, next) {
                                    
                                    var user = new User();
                                    user.email = email;
                                    user.invitation_token = token;
                                    user.invitation_expires = Date.now() + 43200000; // 12 hour
                                    user.mode = 'invite';
                                    
                                    user.save(function(err) {
                                      next(err, token, user);
                                    });
                                    
                                    
                                    
                                }, function(token, user, next) {
                                    user.url_invitation = req.protocol + '://' + req.headers.host + '/invite/' + token

                                    Mailer.sendOne('invitation', "Numa Digital Fitness - Invitation", user, function (err, responseStatus, html, text){
                                      next(err, responseStatus);
                                    })
                                    
                                    var friend = new Friend({user_id: user._id, email: email, referred_by : user_id , status_flag : 'I'});
                                    
                                    friend.save(function(err) {
                                      console.log(err);
                                    });
                                
                                     Friend.findById(friend, function (err, doc) {
                                            
                                          var message = new Object();
                                          
                                          message.friend  = doc;	
                                          message.status  = '200';
                                          message.message = 'Invitation sent successfully.';
                                          
                                          return utils.responses(res, 200, message)			  
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
                            
                    }	
						
			  
			  	  			  
		  }else{
		  
			message.status= '401';
			message.message = msg;
  
			return utils.responses(res, 401, message)
 
		  }
  })    
 
}



