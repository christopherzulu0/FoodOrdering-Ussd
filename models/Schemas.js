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
  Role:{
    type: String,
    default : 'User'
  }
});

const FoodCategorySchema = mongoose.Schema({
  Categories: {
    type: String,
    required: true,
  },

  Foods: [{
    _id: {
      type: mongoose.Types.ObjectId,
      auto: true,
    },
    FoodName: {
      type: String,
      required: true 
    },
    Price:{
      type: Number,
      required:true
    },
  Order_id: {
      type: String,
      required: true
    }
   
  }],
});


const OrderSchema = mongoose.Schema({
  
      _id: {
        type: mongoose.Types.ObjectId,
        auto: true,
      },
      FoodName: {
        type: String,
        required: true 
      },
      Price:{
        type: Number,
        required:true
      },
    Order_id: {
        type: String,
        required: true
      },
      Status: {
        type: String,
        enum: ['Inprogress', 'Ready','Pending'],
        default: 'Pending'
      },
});


const CartSchema = mongoose.Schema({

    _id: {
      type: mongoose.Types.ObjectId,
      auto: true,
    },
    FoodName: {
      type: String,
      required: true 
    },
    Price:{
      type: Number,
      required:true
    },
  Order_id: {
      type: String,
      required: true
    },
   Number:{
    type:Number,
    required: true
   }
  

});

const User = mongoose.model('User', UserSchema);
const category = mongoose.model('category',FoodCategorySchema);
const order = mongoose.model('order',OrderSchema);
const cart = mongoose.model('cart',CartSchema);
module.exports = {
  User,
  category,
  order,
  cart
};
