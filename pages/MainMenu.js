const {
    User,
    category,
    order,
    cart
} = require('../models/Schemas');


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

let selectedCategories ="";
let cartData = "";

const MainMenu = {
    Menus: async (textArray, phoneNumber) => {
        const level = textArray.length;
        let response = "";
      
        if (level === 1) {
            const categories = await getCategoriesFromDB();
        
            if (categories.length > 0) {
                // If categories are found, display them in the USSD response
                response = `CON <b>Choose Category:</b>\n`;
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

        if(level === 2){
            try {
                const selectedCategoryIndex = parseInt(textArray[1]) - 1;
                const selectedCategoryName = selectedCategories[selectedCategoryIndex];
                // Retrieve the selected category from the database based on selectedCategoryName
                const selectedCategory = await category.findOne({ Categories: selectedCategoryName });
        
                // Check if the category exists
                if (selectedCategory) {
                    // Get the list of foods for editing
                    const foods = selectedCategory.Foods;
        
                    if (foods.length > 0) {
                        // If foods are found, display them for editing
                        response = `CON <b>Select food to add to cart:</b>\n`;
                        foods.forEach((food, index) => {
                            response += `${index + 1}. ${food.FoodName} - K ${food.Price}\n`;
                            return response;
                        });
                        response += `99. Back\n`;
                        return response;
                    } else {
                        // If no foods are found, provide a message
                        response = `END No foods found .\n`;
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
                response = 'END An unexpected error occurred while retrieving foods .';
                return response;
            }
        }
        if (level === 3) {
            try {
                const selectedCategoryIndex = parseInt(textArray[1]) - 1;
                const selectedCategoryName = selectedCategories[selectedCategoryIndex];
        
                // Retrieve the selected category from the database based on selectedCategoryName
                const selectedCategory = await category.findOne({ Categories: selectedCategoryName });
        
                if (selectedCategory) {
                    const selectedFoodIndex = parseInt(textArray[2]) - 1;
                    const selectedFood = selectedCategory.Foods[selectedFoodIndex];
        
                    response = `CON <b>Verify food details</b>

                                Food Name: <b>${selectedFood.FoodName}</b>
                                Price: <b>K ${selectedFood.Price}</b>

                                1. Add to cart
                                99. Go Home`;
                    return response;
                } else {
                    // Handle the case where the specified category does not exist
                    response = 'END Specified category not found.';
                    return response;
                }
            } catch (error) {
                // Handle any errors that occur during database operations
                console.error(error);
                response = 'END An unexpected error occurred while retrieving food details.';
                return response;
            }
        }if(level === 4 && textArray[3] ==='1'){
            
                const selectedCategoryIndex = parseInt(textArray[1]) - 1;
                const selectedCategoryName = selectedCategories[selectedCategoryIndex];
                // Retrieve the selected category from the database based on selectedCategoryName
                const selectedCategory = await category.findOne({ Categories: selectedCategoryName });
                const selectedFoodIndex = parseInt(textArray[2]) - 1;
               const selectedFood = selectedCategory.Foods[selectedFoodIndex];

               
                function addCart() {
                    return new Promise(async (resolve, reject) => {
                    
                            
                            cartData = {
                                FoodName: selectedFood.FoodName,
                                Price: selectedFood.Price,
                                Order_id:selectedFood.Order_id,
                                Number: phoneNumber
                            };
                        
                       
    
                        try {
                            // create user and register to DB
                            let user = await cart.create(cartData);
                            resolve(user);
                        } catch (error) {
                            reject(error);
                        }
                    });
                }
    
                // Call the asynchronous function and handle the response
                let data = await addCart();
                // If user creation failed
                if (!data) {
                    response = "END An unexpected error occurred... Please try again later";
                    return response;
                }
                // if user creation was successful
                else {
    
                    response = `CON  <b>${selectedFood.FoodName}</b> was added successfully to the cart.
                      99. Go Home
                    `;
                    return response;
                }
        }
        





      }
}

module.exports = MainMenu;