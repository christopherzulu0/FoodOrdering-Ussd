const mongoose = require('mongoose');
const shortid = require('shortid');


const UserSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Email: {
    type: String,
    required: true
  },
  DOB: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    required: true
  },
  phoneNumber: {
    type:Number,
    required: true
  },
});



const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};
