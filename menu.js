const { User,Item} = require('./models/Schemas');
const axios = require("axios");
const countryCode = require("./util/countryCode");
const bcrypt = require("bcrypt");
const qs = require("qs");
const { response } = require('express');
const i18n = require("i18n");







const menu = {
  MainMenu: (userName) => {
    let response = "";
     response = `CON Hi <b>${userName}</b>! 
                         Choose an option to proceed
                    1. Menu
                    2. Cart(2)
                    3. Order Status
                    4. Your orders(2)
            `;

    return response;
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
  ,
  


  Menus: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = "";
  
    if (level === 1) {
      try {
        // Fetch all distinct food categories
        const distinctCategories = await Item.distinct("foodCategory");
        response = "CON Select a food category:\n";
        distinctCategories.forEach((category, index) => {
          response += `${index + 1}. ${category}\n`;
        });
      } catch (error) {
        response = "END Failed to retrieve food categories. Please try again.";
      }
    } else if (level === 2) {
      const selectedCategoryIndex = parseInt(textArray[1]) - 1;
  
      try {
        const distinctCategories = await Item.distinct("foodCategory");
  
        if (selectedCategoryIndex >= 0 && selectedCategoryIndex < distinctCategories.length) {
          const selectedCategory = distinctCategories[selectedCategoryIndex];
          const menuItems = await Item.find({ foodCategory: selectedCategory });
          response = `CON Food items in category ${selectedCategory}:\n`;
          menuItems.forEach((item, index) => {
            response += `${index + 1}. ${item.foodName} = K<b>${item.foodPrice}</b>\n`;
          });
        } else {
          response = "END Invalid category selection.";
        }
      } catch (error) {
        response = "END Failed to retrieve menu items. Please try again.";
      }
    } else if (level === 3) {
      const selectedMenuItemIndex = parseInt(textArray[2]) - 1;
  
      if (selectedMenuItemIndex >= 0 && selectedMenuItemIndex < menuItems.length) {
        const selectedMenuItem = menuItems[selectedMenuItemIndex];
        // Place order logic goes here (e.g., sending confirmation to user, storing order in database, etc.)
        response = `CON You have placed an order for ${selectedMenuItem.foodName}. Thank you!`;
      } else {
        response = "END Invalid menu item selection.";
      }
    }
  
    return response;
  },
  Cart: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = "";
  
    if (level === 1) {
      response = `CON Your Cart:
  1. View Cart
  2. Add Item to Cart
  3. Remove Item from Cart
  4. Proceed to Checkout
  5. Back to Main Menu
  
  Please enter the number corresponding to your choice.`;
    } else if (level === 2) {
      const choice = parseInt(textArray[1]);
  
      switch (choice) {
        case 1:
          // Logic to retrieve and display cart items
          response = `CON View Cart:
  1. Meat Pie <b>(ZMW 150)</b>
  2. Nshima With Sausage <b>(ZMW 300)</b>
  3. Back to Cart Menu`;
          break;
  
        case 2:
          // Logic to add item to cart
          response = `CON Add Item to Cart:
  Please enter the number corresponding to the product you want to add:
  1. Meat Pie <b>(ZMW 150)</b>
  2. Nshima With Sausage <b>(ZMW 300)</b>
  3. Back to Cart Menu`;
          break;
  
        case 3:
          // Logic to remove item from cart
          response = `CON Remove Item from Cart:
  Please enter the number corresponding to the product you want to remove:
  1. Meat Pie <b>(ZMW 150)</b>
  2. Nshima With Sausage <b>(ZMW 300)</b>
  3. Back to Cart Menu`;
          break;
  
        case 4:
          // Calculate total cost and confirm order
          const productsInCart = [
            { name: "Meat Pie", price: 150 },
            { name: "Nshima With Sausage", price: 300 },
            // Products currently in the cart
          ];
  
          let totalCost = 0;
          productsInCart.forEach(product => {
            totalCost += product.price;
          });
  
          response = `CON Proceed to Checkout:
  Total Cost: ZMW ${totalCost}
  1. Confirm Order
  2. Cancel`;
          break;
  
        default:
          response = "END Invalid choice.";
          break;
      }
    } else if (level === 3 && textArray[1] === '2') {
      const productChoice = parseInt(textArray[2]);
  
      // Logic for adding item to cart based on user's choice
      const products = [
        { name: "Nshima With Sausage", price: "ZMW 150" },
        { name: "Nshima With Sausage", price: "ZMW 300" },
        // Add more products here
      ];
  
      if (productChoice >= 1 && productChoice <= products.length) {
        const selectedProduct = products[productChoice - 1];
        // Logic to add the selected product to the cart
        response = `END You have added ${selectedProduct.name} to your cart.`;
      } else {
        response = "END Invalid choice.";
      }
  
    } else if (level === 3 && textArray[1] === '3') {
      const productChoice = parseInt(textArray[2]);
  
      // Logic for removing item from cart based on user's choice
      const productsInCart = [
        { name: "Meat Pie", price: "ZMW 150" },
        { name: "Nshima With Sausage", price: "ZMW 300" },
        // Products currently in the cart
      ];
  
      if (productChoice >= 1 && productChoice <= productsInCart.length) {
        const removedProduct = productsInCart[productChoice - 1];
        // Logic to remove the selected product from the cart
        response = `END You have removed ${removedProduct.name} from your cart.`;
      } else {
        response = "END Invalid choice.";
      }
  
    } else if (level === 3 && textArray[1] === '4' && textArray[2] === '1') {
      // Handle order confirmation and completion
      // Implement your logic to process the order, update inventory, etc.
      response = `END Thank you for your order!`;
  
    } else if (level === 3 && textArray[1] === '4' && textArray[2] === '2') {
      // Cancel the order
      response = `END Order cancelled.`;
    }
  
    return response;
  },
  

  OrderStatus: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = "";
  
    if (level === 1) {
      response = `CON Order Status:
  1. Track Order
  2. View Order History
  3. Back to Main Menu
  
  Please enter the number corresponding to your choice.`;
    } else if (level === 2) {
      const choice = parseInt(textArray[1]);
  
      switch (choice) {
        case 1:
          // Logic to track order status
          response = `CON <b>Track Order:</b>
  Please enter your order number to track its status.`;
          break;
  
        case 2:
          // Logic to view order history
          response = `CON <b>View Order History</b>:
  1. Order <b>#1234</b>
  2. Order <b>#5678</b>
  3. Back to Order Status`;
          break;
  
        default:
          response = "END Invalid choice.";
          break;
      }
    } else if (level === 3) {
      // Logic to retrieve and display order status based on user's input
      const orderNumber = textArray[2];
      // Implement your logic to fetch order status based on order number
      const Status = "In Progress"; // Replace with actual order status
  
      response = `END Order #${orderNumber} is currently <b>${Status}.</b>`;
    }
  
    return response;
  },  
AllOrders: async (textArray, phoneNumber) => {
  const level = textArray.length;
  let response = "";

  if (level === 1) {
    response = `CON Order History:
1. View All Orders
2. View Order Details
3. Back to Main Menu

Please enter the number corresponding to your choice.`;
  } else if (level === 2) {
    const choice = parseInt(textArray[1]);

    switch (choice) {
      case 1:
        // Logic to retrieve and display all orders
        response = `CON View All Orders:
1. Order <b>#1234</b>
2. Order <b>#5678</b>
3. Back to Order History`;
        break;

      case 2:
        // Logic to retrieve and display order details
        response = `CON View Order Details:
Please enter the order number to view details:
1. Order <b>#1234</b>
2. Order <b>#5678</b>
3. Back to Order History`;
        break;

      default:
        response = "END Invalid choice.";
        break;
    }
  } else if (level === 3) {
    // Logic to retrieve and display order details based on user's choice
    const orderNumber = textArray[2];
    // Implement your logic to fetch order details based on order number
    const orderDetails = {
      orderNumber: orderNumber,
      products: [
        { name: "Meat Pie",quantity: 2, price: "ZMW 150" },
        { name: "Nshima With Sausage",quantity: 1, price: "ZMW 300" },
        // Add more products here
      ],
      total: "ZMW 250"
    };

    response = `CON Order Details for Order <b>#${orderDetails.orderNumber}:</b>
Products:
1. <b>Meat Pie</b> - Quantity: ${orderDetails.products[0].quantity}, Price: ${orderDetails.products[0].price}
2. <b>Nshima With Sausage</b> - Quantity: ${orderDetails.products[1].quantity}, Price: ${orderDetails.products[1].price}
Total: <b>${orderDetails.total}</b>
1. Back to Order History`;
  }

  return response;
}
,

Admin: async (textArray, phoneNumber) => {
  const level = textArray.length;
  let response = "";

  if (level === 1) {
      response = `CON Welcome to the admin area. Please select an option:
  1. Add Food Item
  2. View Menu`;
      return response;
  } else if (level === 2) {
      const option = textArray[1];

      if (option === '1') {
          response = `CON Enter the food category:`;
      } else if (option === '2') {
          try {
              // Fetch all distinct food categories
              const distinctCategories = await Item.distinct("foodCategory");
              response = "CON Select a food category:\n";
              distinctCategories.forEach((category, index) => {
                  response += `${index + 1}. ${category}\n`;
              });
          } catch (error) {
              response = "END Failed to retrieve food categories. Please try again.";
          }
      }
  } else if (level === 3) {
      const option = textArray[1];

      if (option === '1') {
          const foodCategory = textArray[2];
          response = `CON Enter the food name:`;
      } else if (option === '2') {
          try {
              const selectedCategoryIndex = parseInt(textArray[2]) - 1;
              const distinctCategories = await Item.distinct("foodCategory");

              if (selectedCategoryIndex >= 0 && selectedCategoryIndex < distinctCategories.length) {
                  const selectedCategory = distinctCategories[selectedCategoryIndex];
                  const menuItems = await Item.find({ foodCategory: selectedCategory });
                  response = `CON Food items in category ${selectedCategory}:\n`;
                  menuItems.forEach((item, index) => {
                      response += `${index + 1}. ${item.foodName} = K<b>${item.foodPrice}</b>\n`;
                  });
              } else {
                  response = "END Invalid category selection.";
              }
          } catch (error) {
              response = "END Failed to retrieve menu items. Please try again.";
          }
      }
  } else if (level === 4) {
      const option = textArray[1];

      if (option === '1') {
          const foodName = textArray[3];
          response = `CON Enter the price for ${foodName}:`;
      } else if (option === '2') {
          // Add logic to add the selected food item to the menu
          response = `CON Adding the selected food item to the menu...`;
      }
  } else if (level === 5) {
      const option = textArray[1];

      if (option === '1') {
          async function CreateItem() {
              const data = {
                  foodCategory: textArray[2],
                  foodName: textArray[3],
                  foodPrice: textArray[4]
              };
              let item = await Item.create(data);
              return item;
          }

          let items = await CreateItem();

          if (!items) {
              response = "END An unexpected error occurred... Please try again later";
          } else {
              let foodName = textArray[3];
              let foodCategory = textArray[2];
              let foodPrice = textArray[4];
              response = `CON Food item ${foodName} added to ${foodCategory} with price ${foodPrice}.`;
          }
      } else if (option === '2') {
          // Display the updated menu
          response = `CON Displaying the updated menu...`;
      }
  }

  return response;
}












   
};

module.exports = menu;
