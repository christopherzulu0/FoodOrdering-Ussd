const {
    User,
    category,
    order,
    cart
} = require('../models/Schemas');
const shortid = require('shortid');

//Function for retrieving categories
async function getCategoriesFromDB() {
    try {
        // Fetch categories from the database
        const categories = await category.find({}, 'Categories'); // Assuming you have a 'Category' field in your Category schema
        return categories.map(category => category.Categories); // Extract category names
    } catch (error) {
        console.error(error);
        throw error;
    }
}


let selectedCategories = "";
let selectedOrder =""

const Admins = {
    Admin: async (textArray, phoneNumber, all_processing,all_pending) => {
        const level = textArray.length;
        let response = "";
      
        if (level === 1) {
            response = `CON Welcome to the admin area. Please select an option:
                        1. Manage Foods
                        2. Pending Orders<b>(${all_pending})</b>
                        3. Orders being processed<b>(${all_processing})</b>
                        4. View Menu
                        `;
            return response;
        } 

        //Menu for managing foods
        if(level === 2 && textArray[1] === '1'){
            response = `CON Food Options
                        1. Add Category
                        2. Add Foods
                        3. Delete Foods
                      `;
            return response;
        }
         //Flow for adding food category
        if(level === 3  && textArray[1] === '1' && textArray[2] === '1'){
            response = `CON Enter category Name:`
            return response;
        }
        if(level === 4 && textArray[1] === '1' && textArray[2] === '1'){
            response = `CON Verify Details
                         Category Name: ${textArray[3]}

                         1. Save
                         99. Go Home
                       `
            return response;
        }if(level === 5 && textArray[2] ===  '1' && textArray[4] === '1'){
            function createCategory() {
                return new Promise(async (resolve, reject) => {
                    const categoryData = {
                        Categories: textArray[3], // Assuming the category name is at index 2 in textArray
                    };

                    try {
                        // create user and register to DB
                        let user = await category.create(categoryData);
                        resolve(user);
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            // Call the asynchronous function and handle the response
            let data = await createCategory();
            // If user creation failed
            if (!data) {
                response = "END An unexpected error occurred... Please try again later";
                return response;
            }
            // if user creation was successful
            else {

                response = `CON Category <b>${textArray[3]}</b> was added successfully
                  99. Go Home
                `;
                return response;
            }
        }

        //flow for adding foods
        if(level === 3 && textArray[1] === '1' && textArray[2] === '2'){
            response = `CON Enter food name:`
            return response;
        }
        if(level === 4 && textArray[1] === '1' && textArray[2] === '2'){
            response = `CON Enter food price:`
            return response;
        }
        if(level === 5 && textArray[1] === '1' &&  textArray[2] === '2'){
            const categories = await getCategoriesFromDB();
        
            if (categories.length > 0) {
                // If categories are found, display them in the USSD response
                response = `CON Choose category:\n`;
                categories.forEach((category, index) => {
                    response += `${index + 1}. ${category}\n`;
                });
                response += `0. Back`;
                // Store the available categories for later use
                selectedCategories = categories;
                // Return the response
                return response;
            } else {
                // If no categories are found, provide an appropriate message
                response = `END No categories found.`;
                return response;
            }
        }
        if(level === 6 && textArray[2] === '2'){
            const selectedCategoryIndex = parseInt(textArray[5]) - 1;
            // Retrieve the selected category name using the index
            const selectedCategoryName = selectedCategories[selectedCategoryIndex];

            response = `CON Verify food details

                        Food Name: ${textArray[3]}
                        Category: ${selectedCategoryName}
                        Price: K ${textArray[4]}

                        1. Continue & Save
                        99. Go Home
                        `;
            return response;
        }
        if(level === 7 && textArray[2] === '2' && textArray[6] === '1'){
            try {
                const selectedCategoryIndex = parseInt(textArray[5]) - 1;
                const selectedCategoryName = selectedCategories[selectedCategoryIndex];
                // Retrieve the selected category from the database based on selectedCategoryName
                const selectedCategory = await category.findOne({ Categories: selectedCategoryName });
                const orderid = shortid.generate();
               console.log("Cat:",selectedCategory)
                // Check if the category exists
                if (selectedCategory) {
                    // Push the new course data into the foods array of the selected category
                    selectedCategory.Foods.push({
                        FoodName: textArray[3],
                        Price: textArray[4],
                        Order_id:orderid
                       
                        // Add other course-related fields if applicable
                    });
        
                    // Save the updated category back to the database
                    await selectedCategory.save();
        
                    // Respond with a success message if needed
                    response = `END ${textArray[3]} added to category "${selectedCategoryName}" successfully.`;
                    return response;
                } else {
                    // Handle the case where the specified category does not exist
                    response = 'END Specified category not found. Unable to add the food.';
                    return response;
                }
            } catch (error) {
                // Handle any errors that occur during database operations
                console.error(error);
                response = 'END An unexpected error occurred while adding the food.';
                return response;
            }
        }

        //flow for deleting foods
        if(level === 3 && textArray[2] === '3'){
            const categories = await getCategoriesFromDB();
        
            if (categories.length > 0) {
                // If categories are found, display them in the USSD response
                response = `CON Choose Category:\n`;
                categories.forEach((category, index) => {
                    response += `${index + 1}. ${category}\n`;
                });
                response += `99. Back`;
                // Store the available categories for later use
                selectedCategories = categories;
                // Return the response
                return response;
            } else {
                // If no categories are found, provide an appropriate message
                response = `END No categories found.`;
                return response;
            }
        }
        if(level === 4 && textArray[2] === '3'){
            try {
                const selectedCategoryIndex = parseInt(textArray[3]) - 1;
                const selectedCategoryName = selectedCategories[selectedCategoryIndex];
                // Retrieve the selected category from the database based on selectedCategoryName
                const selectedCategory = await category.findOne({ Categories: selectedCategoryName });
        
                // Check if the category exists
                if (selectedCategory) {
                    // Get the list of foods for editing
                    const foods = selectedCategory.Foods;
        
                    if (foods.length > 0) {
                        // If foods are found, display them for editing
                        response = `CON <b>Select food to delete:</b>\n`;
                        foods.forEach((food, index) => {
                            response += `${index + 1}. ${food.FoodName} - K ${food.Price}\n`;
                            return response;
                        });
                        response += `99. Back\n`;
                        return response;
                    } else {
                        // If no foods are found, provide a message
                        response = `END No foods found for deleting.\n`;
                        return response;
                    }
                } else {
                    // Handle the case where the specified category does not exist
                    response = 'END Specified category not found.';
                    return response;
                }
            } catch (error) {
                // Handle any errors that occur during database operations
                console.error(error);
                response = 'END An unexpected error occurred while retrieving foods for deleting.';
                return response;
            }
        }
        if(level === 5 && textArray[2] === '3'){
            //Delet food from the selected category
            try {
                const selectedCategoryIndex = parseInt(textArray[3]) - 1;
                const selectedCourseIndex = parseInt(textArray[4]) - 1;
        
                const selectedCategoryName = selectedCategories[selectedCategoryIndex];
                const selectedCategory = await category.findOne({ Categories: selectedCategoryName });
        
                if (selectedCategory) {
                    const foods = selectedCategory.Foods;
        
                    if (foods.length > 0 && foods[selectedCourseIndex]) {
                        const courseToDelete = foods[selectedCourseIndex];
                        // Perform the deletion operation here
                        // For example, remove the course from the array and save the updated category
                        foods.splice(selectedCourseIndex, 1);
        
                        // Save the updated category back to the database
                        await selectedCategory.save();
        
                        response = 'END Food deleted successfully!';
                        return response;
                    } else {
                        response = 'END Invalid Food selection. Please try again.';
                        return response;
                    }
                } else {
                    response = 'END Specified category not found. Unable to delete Food.';
                    return response;
                }
            } catch (error) {
                console.error(error);
                response = 'END An unexpected error occurred while deleting the Food.';
                return response;
            }
        }

        //Flow for retrieving Pending orders
        if(level === 2 && textArray[1] === '2'){
            try {
                // Logic to retrieve pending applications from the database
                const pendingOrders = await getPendingOrders();
        
                if (pendingOrders.length > 0) {
                    // If there are pending applications, display them for review
                    response = `CON <b>Pending Orders:</b>\n`;
                    pendingOrders.forEach((orders, index) => {
                        response += `${index + 1}. <b>${orders.FoodName}</b>(<b>K${orders.Price}</b>)
                                                   `;
                    });
                    response += `0. Back\n`;
                    selectedOrder = pendingOrders;
                    return response;
                } else {
                    // If there are no pending applications, display a message
                    response = `END No pending orders for review.\n`;
                    return response
                }
            } catch (error) {
                console.error('Error:', error);
                response = 'END An error occurred while retrieving pending applications. Please try again later.';
            }
        }

        //Get the details of the selected pending order
        if(level === 3 && textArray[1] === '2'){
            const selectedIndex = parseInt(textArray[2]) - 1;
            const selectedPendingOrder = selectedOrder[selectedIndex];

            response = `CON <b>Approve or Decline Order</b>
                         Name: <b>${selectedPendingOrder.FoodName}</b>
                         Price: <b>${selectedPendingOrder.Price}</b>

                         1. Accept
                         2. Reject
                       `;
            return response;
        }

        //Flow for rejecting the accepting
        if(level === 4 && textArray[1] === '2'  && textArray[3] === '1'){
            const selectedIndex = parseInt(textArray[2]) - 1;
            const pending = await order.find({ Status: 'Pending' });
            const selectedRequest = pending[selectedIndex]; // Assuming pendingRequests is already populated
           
            
            // Check if selectedRequest exists and its PaymentStatus is 'Pending'
            if (selectedRequest && selectedRequest.Status === 'Pending') {
              

                // Update the order status to 'Approved' in the database
                try {
                    const updatedOrder = await order.findOneAndUpdate(
                        { Order_id:  selectedRequest.Order_id },
                        { $set: { Status: 'Processing' } },
                        { new: true }
                    );
        
                    if (updatedOrder) {
                        // order status updated successfully
                        // You can optionally perform additional actions here
                        response = 'END Order approved successfully!';
                        return response;
                    } else {
                        // order not found or update failed
                        response = 'END Failed to update order status. Please try again later.';
                        return response;
                    }
                } catch (error) {
                    console.error('Error updating order status:', error);
                    response = 'END An error occurred while updating order status. Please try again later.';
                    return response;
                }
            } else {
                // Invalid order selection or order is not in 'Pending' status
                response = 'END Invalid order selection or order is not in pending status.';
               
            }
        
            return response;
        }

        //Flow for rejecting the order
        if(level === 4 && textArray[1] === '2'  && textArray[3] === '2'){
            const selectedIndex = parseInt(textArray[2]) - 1;
            const pending = await order.find({ Status: 'Pending' });
            const selectedRequest = pending[selectedIndex]; // Assuming pendingRequests is already populated
           
            

            // Check if selectedRequest exists and its PaymentStatus is 'Pending'
            if (selectedRequest && selectedRequest.Status === 'Pending') {
               

                // Update the order status to 'Approved' in the database
                try {
                    const updatedOrder = await order.findOneAndUpdate(
                        { Order_id:  selectedRequest.Order_id },
                        { $set: { Status: 'Rejected' } },
                        { new: true }
                    );
        
                    if (updatedOrder) {
                        // order status updated successfully
                        // You can optionally perform additional actions here
                        response = 'END Order has been rejected!';
                        return response;
                    } else {
                        // order not found or update failed
                        response = 'END Failed to update order status. Please try again later.';
                        return response;
                    }
                } catch (error) {
                    console.error('Error updating order status:', error);
                    response = 'END An error occurred while updating order status. Please try again later.';
                    return response;
                }
            } else {
                // Invalid order selection or order is not in 'Pending' status
                response = 'END Invalid order selection or order is not in pending status.';
               
            }
        
            return response;
        }


        //Flow for updating orders in process to completed
         if(level === 2 && textArray[1] === '3'){
            try {
                // Logic to retrieve orders processing from the database
                const pendingOrders = await getOrdersProcessing();
        
                if (pendingOrders.length > 0) {
                    // If there are orders processing, display them for review
                    response = `CON <b> Orders in process:</b>\n`;
                    pendingOrders.forEach((orders, index) => {
                        response += `${index + 1}. <b>${orders.FoodName}</b>(<b>K${orders.Price}</b>)
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
        }

        //Get the details of the selected order in processing
        if(level === 3 && textArray[1] === '3'){
            const selectedIndex = parseInt(textArray[2]) - 1;
            const selectedPendingOrder = selectedOrder[selectedIndex];

            response = `CON <b>Confirm order as completed</b>
                         Name: <b>${selectedPendingOrder.FoodName}</b>
                         Price: <b>${selectedPendingOrder.Price}</b>

                         1. Confirm finished
                         99. Go Home
                       `;
            return response;
        }

        //Flow completing the order
        if(level === 4 && textArray[1] === '3' && textArray[3] === '1'){
            const selectedIndex = parseInt(textArray[2]) - 1;
            const pending = await order.find({ Status: 'Processing' });
            const selectedRequest = pending[selectedIndex]; // Assuming pendingRequests is already populated
           
            
            // Check if selectedRequest exists and  is 'Processing'
            if (selectedRequest && selectedRequest.Status === 'Processing') {
              

                // Update the order status to 'Ready' in the database
                try {
                    const updatedOrder = await order.findOneAndUpdate(
                        { Order_id:  selectedRequest.Order_id },
                        { $set: { Status: 'Ready' } },
                        { new: true }
                    );
        
                    if (updatedOrder) {
                        // order status updated successfully
                        // You can optionally perform additional actions here
                        response = 'END Order is ready for pick up!';
                        return response;
                    } else {
                        // order not found or update failed
                        response = 'END Failed to update order status. Please try again later.';
                        return response;
                    }
                } catch (error) {
                    console.error('Error updating order status:', error);
                    response = 'END An error occurred while updating order status. Please try again later.';
                    return response;
                }
            } else {
                // Invalid order selection or order is not in 'Pending' status
                response = 'END Invalid order selection or order is not in processing status.';
               
            }
        
            return response;
        }




      }
}


//Get pending orders
const getPendingOrders = async () => {
    try {
        // Perform a database query to find all applications with status 'pending'
        const pendingOrders = await order.find({ Status: 'Pending' });
        return pendingOrders;
    } catch (error) {
        console.error('Error retrieving pending applications:', error);
        throw new Error('Error retrieving pending applications. Please try again later.');
    }
};

//Get Read Orders
const getOrdersProcessing = async () => {
    try {
        // Perform a database query to find all applications with status 'pending'
        const readyOrders = await order.find({ Status: 'Processing' });
        return readyOrders;
    } catch (error) {
        console.error('Error retrieving pending applications:', error);
        throw new Error('Error retrieving pending applications. Please try again later.');
    }
};
module.exports = Admins;