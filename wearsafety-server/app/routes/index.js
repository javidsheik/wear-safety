var express = require('express');
var Route = express.Router();
var config = require('../config/config');
var passport = require('passport');
var lodash = require('lodash')
var Auth = require(config.root + '/app/middleware/authorization');
var fs = require('fs');

var userController = require(config.root + '/app/controllers/users');
var circleController = require(config.root + '/app/controllers/circle');


var root = "";

var API = {}
API.Users = require(config.root + '/app/controllers/API/users');
API.Circles = require(config.root + '/app/controllers/API/circles');
API.Locations = require(config.root + '/app/controllers/API/locations');
API.Places = require(config.root + '/app/controllers/API/places');
API.PushNotification = require(config.root + '/app/controllers/API/push_notify');


// API Routes
Route
  .get('/api',function(req, res) {
	  res.send('Express API');
  })
  .post('/api/oauth/login', API.Users.login)
  .post('/api/oauth/fb_login', API.Users.fb_login)
  .post('/api/oauth/logout', API.Users.logout)
  .post('/api/oauth/signup', API.Users.signup)
  .get('/api/user/profile/:email', API.Users.get_profile)
  .post('/api/user/profile', API.Users.update_profile)
  .post('/api/user/forgot_password', API.Users.postForgotPassword)
  
  //.all('/api/*', Auth.APIrequiresUserLogin)
  
  
  .get('/api/user/devices/:user_id', API.Users.devices_list)
  
  .post('/api/locations/create', API.Locations.create) 
  .get('/api/locations/:circle_id', API.Locations.list)
  
  .post('/api/places/create', API.Places.create) 
  .get('/api/places', API.Places.list)
  
  .post('/api/circles/create', API.Circles.create) 
  .post('/api/circles/add_member', API.Circles.add_member) 
  .get('/api/circles/:id', API.Circles.details)
  
 
  .post('/api/push_notifications/subscribe', API.PushNotification.subscribe)
  .post('/api/push_notifications/unsubscribe', API.PushNotification.unsubscribe)
  .post('/api/push_notifications/send', API.PushNotification.send)
  .get('/api/push_notifications', API.PushNotification.list)

 
// Frontend routes
Route
  .get('/login', userController.login)
  .get('/signup', userController.signup)
  .post('/signup', userController.sendInvitation)
  .get('/logout', userController.logout)
  .get('/forgot-password', userController.getForgotPassword)
  .post('/forgot-password',Auth.hasLogin, userController.postForgotPassword)
  .get('/reset/:token', Auth.hasLogin, userController.getResetPassword)
  .post('/reset/:token', Auth.hasLogin, userController.postResetPassword)
  .get('/invite/:token', userController.getInvitation)
  .post('/invite/:token', userController.create)
  .post('/users/create', userController.create)
  .get('/users/profile/:user_id',userController.user_profile)
  .get('/dashboard', Auth.requiresLogin, userController.show)
  .post('/users/session',
    passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), userController.session)
  .get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }))
  .get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
    res.redirect(req.session.returnTo || '/');
  })
  .get('/', function(req, res) {
    res.render('index', {
      title: 'Wear Safety'
    });
  })
  

  
// #Other Routes
Route
  .get('/circle',  Auth.requiresLogin, circleController.list)
  .get('/circle/create',  Auth.requiresLogin, circleController.create)
  .post('/circle/create',  Auth.requiresLogin, circleController.save)
  .get('/circle/:id', Auth.requiresLogin, circleController.details)  
  

module.exports = Route
