const { cart,order } = require('../models/Schemas');

const OrderStatus = {
  Status: async (textArray, phoneNumber) => {

    // Function to fetch order status from the order collection
    async function fetchOrderStatus(Order_id) {
      try {
          const orders = await order.findOne({ Order_id: Order_id}); // Assuming Order_id is the field representing the order number
    
          // Return the order status if found
          return orders ? orders.Status : null;
      } catch (error) {
          // Handle any errors that may occur during the database query
          console.error('Error fetching order status:', error);
          return null;
      }
    }


      const level = textArray.length;
      let response = "";

      if (level === 1) {
          response = `CON Order Status:
    1. Track Order
    
    Please enter the number corresponding to your choice.`;
      } else if (level === 2) {
          const choice = parseInt(textArray[1]);

          switch (choice) {
              case 1:
                  // Logic to track order status
                  response = `CON <b>Track Order:</b>
    Please enter your order number to track its status.`;
                  break;


              default:
                  response = "END Invalid choice.";
                  break;
          }
      } else if (level === 3) {
          // Logic to retrieve and display order status based on user's input
          const orderNumber = textArray[2];
          // Implement your logic to fetch order status based on order number
          const orderStatus = await fetchOrderStatus(orderNumber); // Replace with actual function to fetch order status

          if (orderStatus) {
              response = `END Order <b>#${orderNumber}</b> is  <b>${orderStatus}.</b>`;
          } else {
              response = `END Order  <b>#${orderNumber}</b> not found.`;
          }
      }

      return response;
  },
};



module.exports = OrderStatus;
