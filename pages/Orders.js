const { order } = require("../models/Schemas");

const Orders = {
    AllOrders: async (textArray, phoneNumber) => {
   //Get orders
   const getOrdersProcessing = async () => {
    try {
        // Perform a database query to find all applications with status 'pending'
        const readyOrders = await order.find({ CustomerNumber: phoneNumber });
        return readyOrders;
    } catch (error) {
        console.error('Error retrieving pending applications:', error);
        throw new Error('Error retrieving pending applications. Please try again later.');
    }}



        const level = textArray.length;
        let response = "";

     
        if (level === 1) {
          response = `CON <b>Order History:</b>
      1. View All Orders
      2. View Order Details
      99. Back to Main Menu
      
      Please enter the number corresponding to your choice.`;
        } else if (level === 2) {
          const choice = parseInt(textArray[1]);
      
          switch (choice) {
            case 1:
              try {
                // Logic to retrieve orders processing from the database
                const pendingOrders = await getOrdersProcessing();
        
                if (pendingOrders.length > 0) {
                    // If there are orders processing, display them for review
                    response = `CON <b> Your Orders</b>\n`;
                    pendingOrders.forEach((orders, index) => {
                        response += `${index + 1}. ${orders.FoodName}(<b>K${orders.Price}</b>)
                                                   `;
                    });
                    response += `0. Back\n`;
                    selectedOrder = pendingOrders;
                    return response;
                } else {
                    // If there are no orders processing, display a message
                    response = `END No orders in process for review.\n`;
                    return response
                }
            } catch (error) {
                console.error('Error:', error);
                response = 'END An error occurred while retrieving orders processing. Please try again later.';
            }
              break;
      
            case 2:
              try {
                // Logic to retrieve orders processing from the database
                const pendingOrders = await getOrdersProcessing();
        
                if (pendingOrders.length > 0) {
                    // If there are orders processing, display them for review
                    response = `CON <b> View order details</b>\n`;
                    pendingOrders.forEach((orders, index) => {
                        response += `${index + 1}. ${orders.FoodName}(<b>K${orders.Price}</b>)
                                                   `;
                    });
                    response += `0. Back\n`;
                    selectedOrder = pendingOrders;
                    return response;
                } else {
                    // If there are no orders processing, display a message
                    response = `END No orders in process for review.\n`;
                    return response
                }
            } catch (error) {
                console.error('Error:', error);
                response = 'END An error occurred while retrieving orders processing. Please try again later.';
            }
              break;
      
            default:
              response = "END Invalid choice.";
              break;
          }
        } else if (level === 3) {
          const selectedIndex = parseInt(textArray[2]) - 1;
            const selectedPendingOrder = selectedOrder[selectedIndex];

            response = `CON <b>${selectedPendingOrder.FoodName} Details</b> 
                         Price: <b>K${selectedPendingOrder.Price}</b>
                         Order#: <b>${selectedPendingOrder.Order_id}</b>
                         99. Go Home
                       `;
        }
            return response;
        
      }
}

module.exports = Orders;