// Module dependencies

process.env.TMPDIR = '.';
global.__base = __dirname + '/';

var path          = require('path');
var fs            = require('fs');
var express       = require('express');
var mongoose      = require('mongoose');
var passport      = require('passport');
var config        = require(__dirname + '/app/config/config');
var view_helper   = require(__dirname + '/app/helper/views-helper');
var http          = require('http');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.config = config;

// Database
require('./app/config/database')(app, mongoose);




var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
});

app.set('view engine', 'jade');
app.locals.build_menu = view_helper.build_menu
app.locals.icon = view_helper.icon





require('./app/config/passport')(app, passport);

// express settings
require('./app/config/express')(app, express, passport);

io.set('log level', 1000);


server.listen(app.get('port'));

// set up our socket server
require('./app/middleware/sockets')(io);    


module.exports = app;
