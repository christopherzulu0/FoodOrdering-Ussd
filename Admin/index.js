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

const Admins = {
    Admin: async (textArray, phoneNumber) => {
        const level = textArray.length;
        let response = "";
      
        if (level === 1) {
            response = `CON Welcome to the admin area. Please select an option:
                        1. Manage Foods
                        2. Pending Orders(5)
                        3. Accepted Orders(5)
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
        if(level === 3 && textArray[2] === '1'){
            response = `CON Enter category Name:`
            return response;
        }
        if(level === 4 && textArray[2] === '1'){
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
        if(level === 3 && textArray[2] === '2'){
            response = `CON Enter food name:`
            return response;
        }
        if(level === 4 && textArray[2] === '2'){
            response = `CON Enter food price:`
            return response;
        }
        if(level === 5 && textArray[2] === '2'){
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

      }
}

module.exports = Admins;