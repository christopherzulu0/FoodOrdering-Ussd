const {Transaction, Wallet, User,Savings, cart, order} = require('./models/Schemas');
const express = require("express");
const i18n = require("i18n");

const router = express.Router();
const {
    MainMenu,
    Register,
    unregisteredMenu,
  } = require("./menu");
  const {Menus} = require('./pages/MainMenu');
  const {AllOrders} = require('./pages/Orders');
  const {Cart} = require('./pages/ViewCart');
  const {Status} = require('./pages/OrderStatus');
  const {Admin} = require('./Admin/index')

  const mongoose = require("mongoose");
  const dotenv = require("dotenv");
  const cors = require("cors");
  const app = express();


  //Configuring Express
  dotenv.config();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  mongoose.set('strictQuery', true);
  const connectionString = process.env.DB_URI;
  
  //Configure MongoDB Database
  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      console.log("MongoDB Running Successfully");
    })
    .catch((err) => {
      console.log({ err });
      console.log("MongoDB not Connected ");
    });



router.post("/", (req, res) => {
  

  const { sessionId, serviceCode, phoneNumber, textbody } = req.body;

  console.log('#', req.body);
  
  let spintext
  String(req.body.text).lastIndexOf('*99') != -1 ? spintext = req.body.text.slice(String(req.body.text).lastIndexOf('*99') + 4) : spintext = req.body.text ;
  const text = spintext
  
  User.findOne({phoneNumber: phoneNumber })
    .then( async (user) => {
      // AUTHENTICATION PARAMETERS
      let userName;
      let userRegistered;
      let response = "";
      let cartlength = "";
      let total = "";
      let user_orders = "";
      let total_orders = "";
      let total_processing = "";
      let pending_orders = "";
      let Admins = ""

      if (!user) {
        userRegistered = false;
      } else {
        userRegistered = true;
        userName = user.Name;
        
      }

      cartlength = await cart.find({Number: phoneNumber});
      total = cartlength.length;


      user_orders = await order.find({CustomerNumber:phoneNumber});
      total_orders = user_orders.length;
      

      total_processing = await order.find({Status:'Processing'});
      const all_processing = total_processing.length;

      pending_orders = await order.find({Status:"Pending"});
      const all_pending = pending_orders.length;

 
      Admins = await User.findOne({ phoneNumber: phoneNumber });
      checkRole = Admins ? Admins.Role : null;
      
      // Check if the user has the 'Admin' role
      let isAdmin = checkRole === 'Admin';
       
        



      // MAIN LOGIC
      if (text == "" && userRegistered == true) {
        response = MainMenu(userName,total,total_orders,isAdmin);
      } else if (text == "" && userRegistered == false) {
        response = unregisteredMenu();
      } else if (text != "" && userRegistered == false) {
        const textArray = text.split("*");
        switch (textArray[0]) {
          case "1":
            response = await Register(textArray, phoneNumber);
            break;
          default:
            response = "END Invalid choice. Please try again";
        }
      } else {
        const textArray = text.split("*");

        switch (textArray[0]) {
          case "1":
            response = await Menus(textArray, phoneNumber);
            break;
          case "2": 
            response = await Cart(textArray, phoneNumber);
              break;
          case "3": 
          response = await Status(textArray, phoneNumber);
            break;
          case "4":
            response = await AllOrders(textArray,phoneNumber);
              break;
          case "5":
            response = await Admin(textArray, phoneNumber,all_processing,all_pending);
              break;
          default:
              response = "END Invalid choice. Please try again";
        }

      }
  
  // Print the response onto the page so that our SDK can read it
  res.set("Content-Type: text/plain");
  res.send(response);
  // DONE!!!
})





.catch((err) => {
    console.log({ err });
  });
});

module.exports = router;