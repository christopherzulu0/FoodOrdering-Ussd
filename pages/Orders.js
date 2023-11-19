const Orders = {
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
}

module.exports = Orders;