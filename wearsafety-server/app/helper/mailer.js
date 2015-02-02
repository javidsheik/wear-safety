var _              = require('lodash')
var path           = require('path')
var config         = require('../config/config')
var templatesDir   = path.resolve(config.root + '/app/views/mailer/')
var nodemailer     = require('nodemailer')
//var emailTemplates = require('swig-email-templates')
var swig = require('swig');

var transport = nodemailer.createTransport({
      service: 'Mailgun',
      auth: {
        user: config.mailgun.user,
        pass: config.mailgun.password
      }
    });


var options = {
  root: path.join(__dirname, "templates"),
  // any other swig options allowed here
};

/*
exports.sendOne = function(temp, subject, obj, fn) {

	emailTemplates(options, function(err, render) {
	  
	  var context = obj;
	  
	  render(temp +'.html', context, function(err, html, text) {
	  
		 transport.sendMail({
				from: 'Admin <info@fit.com>',
				to: locals.email,
				subject: subject,
				html: html,
				// generateTextFromHTML: true,
				text: text
			  }, function(err, responseStatus) {
				if (err) {
				  console.log(err)
				} else {
				  return fn(null, responseStatus.message, html, text)
				}
			  });

			});
		});
};

	
exports.sendOne = function(temp, subject, obj, fn) {
  emailTemplates(templatesDir, function(err, template) {
    if (err) {
      console.log(err)
    } else {

      var locals = obj

      template(temp, locals, function(err, html, text) {
        if (err) {
          console.log(err)
        } else {

          transport.sendMail({
            from: 'Tricks.JS <info@gushcentral.com>',
            to: locals.email,
            subject: subject,
            html: html,
            // generateTextFromHTML: true,
            text: text
          }, function(err, responseStatus) {
            if (err) {
              console.log(err)
            } else {
              return fn(null, responseStatus.message, html, text)
            }
          });

        }
      });
    }
  })

}
*/


exports.sendOne = function(temp, subject, obj, fn) {

	// Compile a file and store it, rendering it later
	var tpl = swig.compileFile(templatesDir + '/' + temp + '/' +'html.ejs');
	
	var html = tpl(obj);
	
	var textTpl = swig.compileFile(templatesDir + '/' + temp + '/' +'text.ejs');
	
	var text = textTpl(obj);
	
	console.log(html);
	
	/*transport.sendMail({
            from: 'Numa Digital Fitness <info@numaforce.com>',
            to: obj.email,
            subject: subject,
            html: html,
            // generateTextFromHTML: true,
			text: text
            
          }, function(err, responseStatus) {
            if (err) {
              console.log(err)
            } else {
              return fn(null, responseStatus.message, html, text)
            }
          });*/
	}