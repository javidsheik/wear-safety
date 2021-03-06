
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema
var CreateUpdatedAt = require('mongoose-timestamp');
var crypto = require('crypto');
var oAuthTypes = ['twitter', 'facebook', 'google'];

var mongoose_thumbnail = require('mongoose-thumbnail');
var path = require('path')
var _ = require('lodash');

/**
 * User Schema
 */
var schemaOptions = {
    toObject: {
      virtuals: true
    }
    ,toJSON: {
      virtuals: true
    }
  };
  
var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    require: true,
    lowercase: true
  },
  first_name:    String,
  last_name:     String,
  gender:        String,
  date_of_birth: Date,
  address:       String,
  city:          String,
  state:         String,
  country:       String,
  zip:           Number,
  mobile:        Number,
  photo_profile: String,
  facebook_id:      {},
  tokens:        [],
  provider: {
    type: String,
    default: 'local'
  },
  hashed_password: {
    type: String
  },
  salt: {
    type: String
  },
  reset_password_token: String,
  reset_password_expires: Date,
  invitation_token: String,
  invitation_expires: Date,
  device_id : String
  
},schemaOptions)

UserSchema.plugin(CreateUpdatedAt)

var thumbnailPlugin = mongoose_thumbnail.thumbnailPlugin;
var make_upload_to_model = mongoose_thumbnail.make_upload_to_model;

var uploads_base = path.join(global.__base , "/public/uploads");
//var uploads = path.join(uploads_base, "u");

UserSchema.plugin(thumbnailPlugin, {
    name: "profile_photo",
    format: "png",
    size: 80,
    inline: false,
    save: true,
    upload_to: make_upload_to_model(uploads_base, 'photos'),
    relative_to: uploads_base
});


/**
 * Virtuals
 */

 
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })

UserSchema
  .virtual('mode')
  .set(function(mode) {
    this._mode = mode    
  })
  .get(function() { return this._mode })

UserSchema
  .virtual('linked')
  .get(function() { return !this.invitation_expires ? true : false}) 

UserSchema
  .virtual('device_linked')
  .get(function() { return this.device_id ? true : false}) 

UserSchema
  .virtual('profile_picture')
  .get(function() { return '/uploads/' + this.profile_photo.rel}) 

  
var AccessTokenSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    expires: {
        type: Date,
        default: Date.now
    }
});
 
 
var PushNotificationSchema = new Schema({
      user_id: 
	  {
            type : Schema.ObjectId,
            ref : 'User'
      },
     device_type: {
            type: 'String',
            required: true,
            enum: ['ios', 'android'],
            lowercase: true
        },
     device_token: {
            type: 'String',
            required: true
    }
});
 
/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

// the below 5 validations only apply if you are signing up traditionally


UserSchema.path('email').validate(function (email) {
  if (this.doesNotRequireValidation()) return true
  return email.length
}, 'Email cannot be blank')

UserSchema.path('email').validate(function (email, fn) {
  var User = mongoose.model('User')
  
  if (this.doesNotRequireValidation()) fn(true)
  
  // Check only when it is a new user or when email field is modified
  if (this.isNew || this.isModified('email')) {
  
    User.find({ email: email }).exec(function (err, users) {
      fn(!err && users.length === 0)
    })
  } else fn(true)
}, 'Email already exists')

UserSchema.path('hashed_password').validate(function (hashed_password) {
  if (this.doesNotRequireValidation()) return true
  return hashed_password.length
}, 'Password cannot be blank')


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (this._mode != 'invite' && !validatePresenceOf(this.password)
    && oAuthTypes.indexOf(this.provider) === -1)
    next(new Error('Invalid password'))
  else
    next()
})

/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return ''
    var encrypred
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encrypred
    } catch (err) {
      return ''
    }
  },

  generateConfirmationToken: function(password) {
    if (!password) return '';
    var encrypred_confirm_code
    try {
      encrypred_confirm_code = crypto.createHmac('sha1',  this.salt).update(password).digest('hex')
      return encrypred_confirm_code
    } catch (err) {
      return ''
    }
  },


  /**
   * Validation is not required if using OAuth
   */

  doesNotRequireValidation: function() {
    return ~oAuthTypes.indexOf(this.provider);
  }
}




module.exports = mongoose.model('User', UserSchema)
module.exports = mongoose.model('AccessToken', AccessTokenSchema)
module.exports = mongoose.model('PushNotification', PushNotificationSchema)

