var jwt      = require('jwt-simple');
var moment   = require('moment');
var mongoose = require('mongoose');


exports.randomString = function (length) {
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHUJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

exports.prettyJSON = function(data) {
  return require("prettyjson").render(data);
}


exports.responses = function(res, status, obj) {
  var resultPrint     = {}
  if (status == 200) {
    resultPrint.data = obj
  } else {
    resultPrint     = obj
  }
  resultPrint.request_id      = require('node-uuid').v4()
  resultPrint.status  = status

  return res.status(status).json(resultPrint )
}

exports.message = function(res,status,message){

       var msg = new Object();
       msg.status = status;
       msg.message = message;
       
       return this.responses(res,status,msg);

}

