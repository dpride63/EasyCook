
// Load saved meal plans from Local Storage
let mealPlans = JSON.parse(localStorage.getItem("mealPlans")) || [];
let editIndex = -1;

// Receive selected recipe from Recipe Finder
const selectedSuggestion = JSON.parse(
    localStorage.getItem("selectedSuggestion")
);

if (selectedSuggestion) {
    document.getElementById("mealName").value = selectedSuggestion.name;

    // Remove the temporary saved suggestion
    localStorage.removeItem("selectedSuggestion");
}

// Display saved meal plans
function displayMealPlans() {
    const savedPlans = document.getElementById("savedPlans");

    calculateTotalServings();

    if (mealPlans.length === 0) {
        savedPlans.innerHTML = "<p>No meal plans saved yet.</p>";
        return;
    }

    savedPlans.innerHTML = mealPlans.map((meal, index) => `
        <div class="meal-card">
            <h3>${meal.name}</h3>
            <p>Date: ${meal.date}</p>
            <p>Meal Type: ${meal.type}</p>
            <p>Servings: ${meal.servings}</p>
            <button onclick="viewMealRecipe(${index})">View Recipe</button>
            <button onclick="editMealPlan(${index})">Edit</button>
            <button onclick="deleteMealPlan(${index})">Delete</button>
        </div>
    `).join("");
}

// View Recipe Details
async function viewMealRecipe(index) {

    const meal = mealPlans[index];

    try {

        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(meal.name)}`
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (!data.meals) {
            alert("Recipe details not found.");
            return;
        }

        // Find matching recipe
        const recipe = data.meals.find(
            item => item.strMeal.toLowerCase() === meal.name.toLowerCase()
        );

        if (!recipe) {
            alert("Recipe details not found.");
            return;
        }

        // Get Ingredients and Measurements
        let ingredientsHTML = "";

        for (let i = 1; i <= 20; i++) {

            const ingredient =
                recipe[`strIngredient${i}`]?.trim();

            const measure =
                recipe[`strMeasure${i}`]?.trim();

            if (ingredient) {

                ingredientsHTML += `
                    <li>${measure || ""} ${ingredient}</li>
                `;
            }
        }

        // Display Recipe Details
        document.getElementById("savedPlans").innerHTML = `

            <div class="recipe-detail">

                <h2>${recipe.strMeal}</h2>

                <img
                    src="${recipe.strMealThumb}"
                    alt="${recipe.strMeal}"
                    width="250"
                >

                <h3> Ingredients</h3>

                <ul>
                    ${ingredientsHTML}
                </ul>

                <h3> Cooking Instructions</h3>

                <p>${recipe.strInstructions}</p>

                <button onclick="displayMealPlans()">
                    Back to My Meal Plans
                </button>

            </div>
        `;

    } catch (error) {

        console.log(error);

        alert("Failed to load recipe details.");

    }
}

// Calculate Total Servings
function calculateTotalServings() {
    let totalServings = 0;

    for (let i = 0; i < mealPlans.length; i++) {
        totalServings += mealPlans[i].servings;
    }

    document.getElementById("mealSummary").innerHTML =
        `<h3>Total Servings: ${totalServings}</h3>`;
}

// Save Meal Plan
const saveMealBtn = document.getElementById("saveMealBtn");

saveMealBtn.addEventListener("click", () => {
    const mealName = document.getElementById("mealName").value.trim();
    const mealDate = document.getElementById("mealDate").value;
    const mealType = document.getElementById("mealType").value;
    const servings = document.getElementById("servings").value;

    if (!mealName || !mealDate || !mealType || !servings) {
        alert("Please fill in all meal plan details.");
        return;
    }

    const servingNumber = Number(servings);

    if (!Number.isInteger(servingNumber) || servingNumber <= 0) {
        alert("Please enter a valid number of servings.");
        return;
    }

    const newMeal = {
        name: mealName,
        date: mealDate,
        type: mealType,
        servings: servingNumber
    };

    const today = new Date().toISOString().split("T")[0];

    if (mealDate < today) {
        alert("Please select today or a future date.");
        return;
    }

    // Add Meal Plan
    if (editIndex === -1) {
        mealPlans.push(newMeal);
    } else {
        mealPlans[editIndex] = newMeal;
        editIndex = -1;
    }

    localStorage.setItem("mealPlans", JSON.stringify(mealPlans));

    displayMealPlans();

    alert("Meal plan saved successfully!");

    document.getElementById("mealName").value = "";
    document.getElementById("mealDate").value = "";
    document.getElementById("mealType").value = "";
    document.getElementById("servings").value = "";
});

// Edit Meal Plan
function editMealPlan(index) {
    const meal = mealPlans[index];
    editIndex = index;

    document.getElementById("mealName").value = meal.name;
    document.getElementById("mealDate").value = meal.date;
    document.getElementById("mealType").value = meal.type;
    document.getElementById("servings").value = meal.servings;
}

// Delete Meal Plan
function deleteMealPlan(index) {
    const confirmDelete = confirm("Are you sure you want to delete this meal plan?");

    if (confirmDelete) {
        mealPlans.splice(index, 1);

        localStorage.setItem("mealPlans", JSON.stringify(mealPlans));

        displayMealPlans();

        alert("Meal plan deleted successfully!");
    }
}

// Display saved meal plans when the page starts
displayMealPlans();
