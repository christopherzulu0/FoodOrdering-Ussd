const axios = require('axios');
const countryCode = require('../util/countryCode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { v4: uuidv4 } = require('uuid');
const { cart,order,User } = require('../models/Schemas');

let items = "";

let totalCost = 0;
const ViewCart = {
  Cart: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = "";


    //PawaPay MTN Deposits
    async function mtnPayouts(amount) {
      const pawaPayEndpointPayouts = process.env.pawaPayEndpoint; // PawaPay API endpoint
      const apiKey = process.env.PawaPayKey; // Replace with your PawaPay API key

      const user = await User.findOne({ phoneNumber: phoneNumber });
      const usernumber = user.phoneNumber;
      const reason  = "Make orders";
      console.log("Reason:",usernumber);

      const payload = {
       depositId: uuidv4(),
        amount: totalCost.toString(),
        currency: "ZMW",
        country: "ZMB",
        correspondent: "MTN_MOMO_ZMB",
        payer: {
          type: "MSISDN",
          address: {
            value: usernumber,
          },
        },
        customerTimestamp: new Date().toISOString(),
        statementDescription: reason,
        created: new Date().toISOString(),
        receivedByRecipient: new Date().toISOString(),
        correspondentIds: {
          MTN_INIT: "764724",
          MTN_FINAL: "hsdhs21",
        },
        failureReason: {
          failureCode: "OTHER_ERROR",
          failureMessage: "Recipient's address is blocked",
        },
      };
    
      try {
        const response = await axios.post(pawaPayEndpointPayouts, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        });
    
        console.log("Response status code:", response.status);
        console.log("Response data:", response.data);
        return response.data;
      } catch (error) {
        console.error("Payment request error:", error.response);
        throw new Error("Payment request failed");
      }
    }


    //Logic for Airtel Payments
    //PawaPay MTN Deposits
    async function airtelPayouts(amount) {
      const pawaPayEndpointPayouts = process.env.pawaPayEndpoint; // PawaPay API endpoint
      const apiKey = process.env.PawaPayKey; // Replace with your PawaPay API key

      const user = await User.findOne({ phoneNumber: phoneNumber });
      const usernumber = user.phoneNumber;
      const reason  = "Make orders";
      console.log("Reason:",usernumber);

      const payload = {
       depositId: uuidv4(),
        amount: totalCost.toString(),
        currency: "ZMW",
        country: "ZMB",
        correspondent: "AIRTEL_OAPI_ZMB",
        payer: {
          type: "MSISDN",
          address: {
            value: usernumber,
          },
        },
        customerTimestamp: new Date().toISOString(),
        statementDescription: reason,
        created: new Date().toISOString(),
        receivedByRecipient: new Date().toISOString(),
        correspondentIds: {
          AIRTEL_INIT: "764724",
          AIRTEL_FINAL: "hsdhs21"
        },
        failureReason: {
          failureCode: "OTHER_ERROR",
          failureMessage: "Recipient's address is blocked",
        },
      };
    
      try {
        const response = await axios.post(pawaPayEndpointPayouts, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        });
    
        console.log("Response status code:", response.status);
        console.log("Response data:", response.data);
        return response.data;
      } catch (error) {
        console.error("Payment request error:", error.response);
        throw new Error("Payment request failed");
      }
    }



    if (level === 1) {
      // Main menu options
      response = `CON Your Cart:
      1. View Cart
      2. Remove Item from Cart
      3. Proceed to Checkout
      99. Back to Main Menu
      
      Please enter the number corresponding to your choice.`;
    } else if (level === 2) {
      const choice = parseInt(textArray[1]);

      switch (choice) {
        case 1:
          try {
            const cartItems = await cart.find({ Number: phoneNumber });

            // Check if cartItems is not null or undefined
            if (cartItems && cartItems.length > 0) {
              response = `CON View Cart:\n`;
              cartItems.forEach((item, index) => {
                response += `${index + 1}. ${item.FoodName} - K ${item.Price}\n`;
              });
              items = cartItems; // Assuming you want to store cartItems for later use
              return response;
            } else {
              // If no items are found, provide an appropriate message
              response = `END No cart items found.`;
              return response;
            }
          } catch (error) {
            // Handle any errors that occur during database operations
            console.error(error);
            response = 'END An unexpected error occurred while retrieving cart items.';
            return response;
          }
          break;

        case 2:
          try {
            const cartItems = await cart.find({ Number: phoneNumber });

            // Check if cartItems is not null or undefined
            if (cartItems && cartItems.length > 0) {
              response = `CON View Cart:\n`;
              cartItems.forEach((item, index) => {
                response += `${index + 1}. ${item.FoodName} - K${item.Price}\n`;
              });
              items = cartItems; // Assuming you want to store cartItems for later use
              return response;
            } else {
              // If no items are found, provide an appropriate message
              response = `END No cart items found.`;
              return response;
            }
          } catch (error) {
            // Handle any errors that occur during database operations
            console.error(error);
            response = 'END An unexpected error occurred while retrieving cart items.';
            return response;
          }

          case 3:
            // Assuming `items` contains the cart items retrieved from the database
            const cartItems = await cart.find({ Number: phoneNumber });
            if (cartItems && cartItems.length > 0) {
              
        
                // Sum up the prices of all cartItems in the cart
                cartItems.forEach(item => {
                    totalCost += item.Price;
                });
        
                response = `CON Proceed to Checkout:
                    Total Cost: K ${totalCost}
                    1. Continue
                    2. Cancel`;
            } else {
                response = "END No items in the cart.";
            }
            break;
          }        
    } else if (level === 3 && textArray[1] === '2') {
      const productChoice = parseInt(textArray[2]);

      // Logic for removing item from cart based on user's choice
      if (productChoice >= 1 && productChoice <= items.length) {
          const removedProduct = items[productChoice - 1];

          try {
              // Remove the selected product from the cart collection in the database
              const deletedItem = await cart.findOneAndDelete({
                  Number: phoneNumber,
                  FoodName: removedProduct.FoodName,
              });

              if (deletedItem) {
                  response = `END You have removed ${removedProduct.FoodName} from your cart.`;
                  // Update the 'items' array after removing from the database
                  items = items.filter(item => item.FoodName !== removedProduct.FoodName);
              } else {
                  response = "END Error removing item from the cart.";
              }
          } catch (error) {
              // Handle any errors that may occur during the database operation
              console.error('Error removing item from cart:', error);
              response = 'END An unexpected error occurred while removing the item from the cart.';
          }
        }

    } 
    //Display the options for payment gateways
    else if (level === 3 && textArray[1] === '3' && textArray[2] === '1') {
       response =`CON Choose the network provider, you want to make payments with:
                  1. MTN ZM
                  2. Airtel ZM
                  99. Go home
                 `;
                 return response;
    }

    //Logic for making money using MTN Zm
    else if (level === 4 && textArray[1] === '3' && textArray[3] === '1') {
      // Handle order confirmation and completion
      try {
          // Call mtnPayouts function and check its status
          const payoutStatus = await mtnPayouts( totalCost);
  
          // Check if the payout was successful (customize the condition based on your response)
          if (payoutStatus.status === 'ACCEPTED') {
              // Assuming `items` contains the cart items retrieved from the database
              const items = await cart.find({ Number: phoneNumber });
  
             console.log('Amount Paid:',totalCost)
  
              if (items && items.length > 0) {
                  // Create an array to store order documents
                  const orderDocuments = [];
  
                  // Iterate through cart items and create order documents
                  items.forEach(item => {
                      const orderDocument = new order({
                          FoodName: item.FoodName,
                          Price: item.Price,
                          Order_id: item.Order_id,
                          CustomerNumber: phoneNumber,
                          TotalAmountPaid: totalCost
                          // Add other fields as needed
                      });
  
                      orderDocuments.push(orderDocument);
                  });
  
                  // Save order documents to the database
                  const savedOrders = await order.insertMany(orderDocuments);
  
                  // Delete cart items after placing the order
                  const deletedItems = await cart.deleteMany({ Number: phoneNumber });
  
                  // Implement other logic if needed (e.g., update inventory)
  
                  response = `END You have successfully placed an order.`;
                  return response;
              } else {
                  response = "END No items in the cart.";
                  return response;
              }
          } else {
              // If the payout was not successful, handle accordingly
              response = 'END Payout to recipient failed. Please try again.';
              return response;
          }
      } catch (error) {
          // Log the detailed error information
          console.error('Error processing order:', error);
          response = 'END An unexpected error occurred while processing the order.';
          return response;
      }
  }

  //Logic for making money using Airtel Zm
  else if (level === 4 && textArray[1] === '3' && textArray[3] === '2') {
    // Handle order confirmation and completion
    try {
        // Call mtnPayouts function and check its status
        const payoutStatus = await airtelPayouts( totalCost);

        // Check if the payout was successful (customize the condition based on your response)
        if (payoutStatus.status === 'ACCEPTED') {
            // Assuming `items` contains the cart items retrieved from the database
            const items = await cart.find({ Number: phoneNumber });

           console.log('Amount Paid:',totalCost)

            if (items && items.length > 0) {
                // Create an array to store order documents
                const orderDocuments = [];

                // Iterate through cart items and create order documents
                items.forEach(item => {
                    const orderDocument = new order({
                        FoodName: item.FoodName,
                        Price: item.Price,
                        Order_id: item.Order_id,
                        CustomerNumber: phoneNumber,
                        TotalAmountPaid: totalCost
                        // Add other fields as needed
                    });

                    orderDocuments.push(orderDocument);
                });

                // Save order documents to the database
                const savedOrders = await order.insertMany(orderDocuments);

                // Delete cart items after placing the order
                const deletedItems = await cart.deleteMany({ Number: phoneNumber });

                // Implement other logic if needed (e.g., update inventory)

                response = `END You have successfully placed an order.`;
                return response;
            } else {
                response = "END No items in the cart.";
                return response;
            }
        } else {
            // If the payout was not successful, handle accordingly
            response = 'END Payout to recipient failed. Please try again.';
            return response;
        }
    } catch (error) {
        // Log the detailed error information
        console.error('Error processing order:', error);
        response = 'END An unexpected error occurred while processing the order.';
        return response;
    }
}
  
  
   else if (level === 3 && textArray[1] === '4' && textArray[2] === '2') {
      // Cancel the order
      response = `END Order cancelled.`;
    }

    return response;
  },
};

module.exports = ViewCart;
