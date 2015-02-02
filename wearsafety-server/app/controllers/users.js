"use strict";

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Circle = mongoose.model('Circle');
var Member = mongoose.model('Member');
var async = require('async');
var config = require('../config/config');
var utility = require('utility');
var crypto = require('crypto');
var errorHelper = require(config.root + '/app/helper/errors');
var Mailer   = require(config.root + '/app/helper/mailer');

var login = function (req, res) {

  // console.log(req.user);
  //Insucure way of setting a token.
  
   res.cookie('token', req.user.token);
   res.cookie('user_id', "user" + req.user._id);

  var redirectTo = req.session.returnTo ? req.session.returnTo : '/dashboard'
  delete req.session.returnTo
  req.flash('success', { msg: 'Success! You are logged in.' });
  res.redirect(redirectTo)
}

exports.signin = function (req, res) {}





/**
 * Auth callback
 */

exports.authCallback = login

/**
 * Show login form
 */

exports.login = function (req, res) {
  if(req.isAuthenticated()){
    res.redirect('/dashboard')
    //console.log(req);
  }else{
  console.log('Not Authenticated. Try Login');
  console.log(req.flash('error'));
    res.render('users/login', {
      title: 'Login',
      message: req.flash('error')
    })
  }
}

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  if(req.isAuthenticated()){
    res.redirect('/dashboard')
  } else {
    res.render('users/signup', {
      title: 'Sign up'
    })
  }
}

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout()
  req.flash('success', { msg: 'Success! You have successfully logged out' });
  res.redirect('/')
}

/**
 * Session
 */

exports.session = login



/**
 *  Show
 */

exports.show = function (req, res, next) {
  var user = req.user;
  res.render('users/show', {
    title: user.name,
    user: user
  })
}


/**
 *  Show profile
 */

exports.user_profile = function (req, res, next) {
  var user_id = req.params.user_id;

          User.findOne({_id : user_id}, function(err, user) {
          
          if(user){
          
           var user = req.user;
              res.render('users/profile', {
                title: user.first_name,
                user: user
              })
          }
          else{
             res.render('200', { url: req.url, error: 'User Not found' });
          }
        });
}

exports.getForgotPassword = function (req, res) {
  res.render('users/forgot-password', {
    title: 'Forgot Password'
  });
}


exports.getInvitation = function (req, res) {
  res.render('users/invite', {
    title: 'Send Invitation'
  });
}


exports.sendInvitation = function (req, res) {

  async.waterfall([
    function(next) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        next(err, token);
      });
    },
    function(token, next) {
	    var user = new User(req.body);
        user.invitation_token = token;
        user.invitation_expires = Date.now() + 43200000; // 12 hour
        user.mode = 'invite';
		
        user.save(function(err) {
          next(err, token, user);
        });
    }, function(token, user, next) {
        user.url_invitation = req.protocol + '://' + req.headers.host + '/invite/' + token

        Mailer.sendOne('invitation', "Express Fitness - Send Invitation", user, function (err, responseStatus, html, text){
          next(err, responseStatus);
        })
		
		req.flash('success', { msg: 'Invitation sent successfully.' });
		
      }
    ], function(err) {
		  if (err) {
			err.status = 500;
			errorHelper.custom(res, err);
			req.flash('errors', { msg: 'Failed sending invitation. please try again later. ' + err });
			return res.redirect('/login');
		  }
      return res.json({message: 'success', status: 200});
    });
}


exports.getInvitation = function (req, res) {
  User
    .findOne({ invitation_token: req.params.token })
    .where('invitation_expires').gt(Date.now())
    .exec(function (err, user) {
      if(user) {
        res.render('users/invite', {
          title: 'Sign Up'
        });
      } else {
        req.flash('errors', { msg: 'Invitation token is invalid or has expired.' });
        return res.redirect('/');
      }
    })

}



exports.postForgotPassword = function (req, res) {

  async.waterfall([
    function(next) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        next(err, token);
      });
    },
    function(token, next) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {

        if (!user) {
          return errorHelper.custom(res, { msg : 'No account with that email address exists.', code: 404 });
        }

        user.reset_password_token = token;
        user.reset_password_expires = Date.now() + 43200000; // 12 hour

        user.save(function(err) {
          next(err, token, user);
        });
      });
    }, function(token, user, next) {
        user.url_reset_password = req.protocol + '://' + req.headers.host + '/reset/' + token

        Mailer.sendOne('forgot-password', "Trick.JS - Password Reset", user, function (err, responseStatus, html, text){
          next(err, responseStatus);
        })
      }
    ], function(err) {
      if (err) {
        err.status = 500;
        errorHelper.custom(res, err);
      }
      return res.json({message: 'success', status: 200});
    });
}


exports.getResetPassword = function (req, res) {
  User
    .findOne({ reset_password_token: req.params.token })
    .where('reset_password_expires').gt(Date.now())
    .exec(function (err, user) {
      if(user) {
        res.render('users/reset-password', {
          title: 'Forgot Password'
        });
      } else {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/');
      }
    })

}


/**
 * Create user
 */


exports.create = function (req, res) {

  req.assert('password', 'Password must be at least 6 characters long.').len(6);
  req.assert('confirm_password', 'Please enter confirm password same with password.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    errors.status = 500;
    errorHelper.custom(res, errors);
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ invitation_token: req.params.token })
        .where('invitation_expires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            return errorHelper.custom(res, { msg : 'Invitation token is invalid or has expired.', code: 410 });
          }
        
		    user.first_name  = req.body.first_name;
			user.last_name   = req.body.last_name;
			user.password    = req.body.password;
			user.gender      = req.body.gender;			
			user.city        = req.body.city;
			user.country     = req.body.country;
            user.device_id   = req.body.device_id;
            
			 user.invitation_expires = '';
			          
             user.save(function(err) {
                if(err) {
                  return errorHelper.proper(err.errors)
                }
                
                var circle = new Circle({user_id: user._id, name : 'Family' , default_flag : true}); // Add a default Circle
                
                circle.save(function(err) {
                
                        if(err) {
                          return errorHelper.proper(err.errors)
                        }
                        
                        var member = new Member({user_id : user._id,added_by : user._id}); // Create a member for creator.
                        
                        member.save(function(err) {
                        
                            Member.findById(member, function (err, doc) {
                            
                                     circle.members.addToSet (member._id );
                                     
                                      circle.save(function (err, circle) {
                                              if(err){
                                                  return errorHelper.proper(err.errors)
                                              }
                                              else
                                              {
                                               done(user);  
                                              }
                                    });
                            });
                        });            
                });
            });
        });
    }], function(user) {
      
	    // manually login the user once successfully signed up
		req.logIn(user, function(err) {
				if (err) {
				 console.log(err)
			    return next(err)
			}
			return res.redirect('/dashboard')
		})
					  
    });
}




exports.postResetPassword = function (req, res) {

  req.assert('password', 'Password must be at least 6 characters long.').len(6);
  req.assert('confirm_new_password', 'Please enter confirm password same with password.').equals(req.body.password);

  var errors = req.validationErrors();

  
 if (errors) {      
      req.flash('errors', {msg: errorHelper.proper(res, errors)});     
      return res.redirect('/reset/' + req.params.token);
  }

  
  async.waterfall([
    function(done) {
      User
        .findOne({ reset_password_token: req.params.token })
        .where('reset_password_expires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            return errorHelper.proper(res, { msg : 'Password reset token is invalid or has expired.', code: 410 });
          }

          user.password = req.body.password;
          user.reset_password_token = '';
          user.reset_password_expires = '';

          user.save(function(err) {
            if(err) {
              return errorHelper.proper(res, err);
            }
            done(user);
          });
        });
    }], function(user) {
      user.url_login = req.protocol + '://' + req.headers.host + '/login'

      Mailer.sendOne('reset-password', "Wear Safety - Your password has been changed", user, function (err, responseStatus, html, text) {
        if(err) {
           req.flash('errors', {msg: errorHelper.proper(res, errors)});     
           return res.redirect('/login');
        } else {
           req.flash('success', {msg: 'Success! Your password has been changed.'});
           return res.redirect('/login');
        }
      })
    });
}
