const { User,Item} = require('./models/Schemas');
const axios = require("axios");
const bcrypt = require("bcrypt");
const qs = require("qs");
const { response } = require('express');
const i18n = require("i18n");

const menu = {
  MainMenu: (userName,total,total_orders,isAdmin) => {
    let response = "";
    if(isAdmin){
      response = `CON Welcome ${userName}! Enter 5 to continue
                 
                  99. Main Menu
      `;
      return response;
    }else {
      response = `CON Hi <b>${userName}</b>! 
            Choose an option to proceed
      1. Menu
      2. Cart<b>(${total})</b>
      3. Order Status
      4. Your orders<b>(${total_orders})</b>
      `;

return response;
    }
  },
  unregisteredMenu: () => {
    let response = "";
    response = `CON Welcome to <b>ZUCT Eats!</b> 
              To get started, please provide us with a few details so we can enhance your dining journey with us.
            1. Register an account
            `;

    return response;
  },
  Register: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = "";
    
    switch (level) {
      case 1:
        response = "CON What is your name";
        break;
      case 2:
        response = "CON What is your email address";
        break;
      case 3:
        response = "CON What is your date of birth";
        break;
      case 4:
          response = "CON Set a login pin(4 Digits)";
          break;
      case 5:
        response = "CON Please confirm your PIN:";
        break;
      case 6:
        response = `CON Confirm Your Details:
                    Name: ${textArray[1]}
                    Email: ${textArray[2]}
                    DOB: ${textArray[3]}

                    1. Confirm & continue
                   `;
        break;
      case 7:
        if(textArray[6] === '1'){
        const pin = textArray[4];
        const confirmPin = textArray[5];
        // Check if the name is strictly alphabets via regex
      
        // Check if the pin is 5 characters long and is purely numerical
         if (pin.toString().length != 4 || isNaN(pin)) {
          response = "END Your must be 4 digits.Please try again!";
        }
        // Check if the pin and confirmed pin is the same
        else if (pin != confirmPin) {
          response = "END Your pin does not match. Please try again";
        } else {
          // proceed to register user
          async function createUser() {
            const userData = {
              Name: textArray[1],
              Email: textArray[2],
              DOB: textArray[3],
              phoneNumber: phoneNumber,
              pin: textArray[5],
              
            };
    
            // hashes the user pin and updates the userData object
            bcrypt.hash(userData.pin, 10, (err, hash) => {
              userData.pin = hash;
            });
    
            // create user and register to DB
            let user = await User.create(userData);

            return user;
          }
    
          // Assigns the created user to a variable for manipulation
          let user = await createUser();
          // If user creation failed
          if (!user) {
            response = "END An unexpected error occurred... Please try again later";
          }
          // if user creation was successful
          else {
            let userName = user.Name;
            let phoneNumber = user.number;
            
    
            response = `END Congratulations ${userName}, You've been successfully registered.`;
          }
        }
        }
        break;
      default:
        break;
    }
    return response;
  }
  
   
};

module.exports = menu;
