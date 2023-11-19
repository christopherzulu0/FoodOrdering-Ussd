const { cart,order } = require('../models/Schemas');

let items = "";

const ViewCart = {
  Cart: async (textArray, phoneNumber) => {
    const level = textArray.length;
    let response = "";

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
                let totalCost = 0;
        
                // Sum up the prices of all cartItems in the cart
                cartItems.forEach(item => {
                    totalCost += item.Price;
                });
        
                response = `CON Proceed to Checkout:
                    Total Cost: K ${totalCost}
                    1. Confirm Order
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

    } else if (level === 3 && textArray[1] === '3' && textArray[2] === '1') {
      // Handle order confirmation and completion
      try {
          // Assuming `items` contains the cart items retrieved from the database
          const items = await cart.find({ Number: phoneNumber });
  
          if (items && items.length > 0) {
              // Create an array to store order documents
              const orderDocuments = [];
  
              // Iterate through cart items and create order documents
              items.forEach(item => {
                  const orderDocument = new order({
                      FoodName: item.FoodName,
                      Price: item.Price,
                      Order_id: item.Order_id,
                      Number: phoneNumber
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
