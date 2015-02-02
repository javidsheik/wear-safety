var mongoose = require('mongoose');
var Lead     = mongoose.model('Lead');
var Review     = mongoose.model('Review');
var Schema = mongoose.Schema;

var config   = require('../../config/config');
var utils    = require(config.root + '/app/helper/utils');
var async    = require('async');
var moment      = require('moment');
var async = require('async');

var utility = require('utility');
var errorHelper = require(config.root + '/app/helper/errors');



exports.list_reviews = function( req, res, next) {

         var condition= '';
			   
			  Review
				.where(condition)
				.sort({createdAt: -1})
				//.skip(options.perPage * options.page)
				//.limit(options.perPage)
				.exec(function(err, reviews) {

				  if(err) return utils.responses(res, 500, err)

				  Review.count(condition, function (err, count) {

					if (err) return errorHelper.mongoose(res, err);

					return utils.responses(res, 200, { reviews: reviews, count: count} );

				  });
	})		  			  		 
  }    

exports.list_leads = function( req, res, next) {

         var condition= '';
			   
			  Lead
				.where(condition)
				.sort({createdAt: -1})
				//.skip(options.perPage * options.page)
				//.limit(options.perPage)
				.exec(function(err, leads) {

				  if(err) return utils.responses(res, 500, err)

				  Lead.count(condition, function (err, count) {

					if (err) return errorHelper.mongoose(res, err);

					return utils.responses(res, 200, { leads: leads, count: count} );

				  });
	})		  			  		 
  }    


exports.add_review = function (req, res, next) {

   var review = new Review(req.body);
   var message=new Object();
 
   review.save(function (err, review) {
         if(err){
              message.status= '401';
              message.message = "Error adding review";
              message.detail = err;
              return utils.responses(res, 401, message)
           }
           else{
              message.status= '200';
              message.message = "Added review successfully";	
              return utils.responses(res, 200, message)
               }
                                                
        });                                        
  }    

exports.capture_lead = function (req, res, next) {

   var lead = new Lead(req.body);
   var message=new Object();
 
   lead.save(function (err, review) {
         if(err){
              message.status= '401';
              message.message = "Error adding lead";
              message.detail = err;
              return utils.responses(res, 401, message)
           }
           else{
              message.status= '200';
              message.message = "Added lead successfully";	
              return utils.responses(res, 200, message)
           }
                                                
        });                                        
  }  

