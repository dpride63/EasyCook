
// Search Button
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");

// Existing Recipe Finder Code
searchBtn.addEventListener("click", async () => {

    const keyword =
        document.getElementById("SearchInput").value.trim();

    console.log(keyword);

    if (!keyword) {
        alert("Please enter recipe name");
        return;
    }

    try {

        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(keyword)}`
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        console.log(data);

        if (!data.meals) {

            result.classList.remove("recipe-detail-view");

            result.innerHTML =
                "<h3>No recipes found. Try another keyword.</h3>";

            return;
        }

        // Remove View Recipe layout
        result.classList.remove("recipe-detail-view");

        // Display Recipe Results
        result.innerHTML = data.meals.map(meal => `
            <div class="recipe-card">

                <img
                    src="${meal.strMealThumb}"
                    alt="${meal.strMeal}"
                    width="250"
                >

                <h2>${meal.strMeal}</h2>

                <p>Category: ${meal.strCategory || "Not available"}</p>

                <p>Area: ${meal.strArea || "Not available"}</p>

                <button class="view-recipe-btn" data-id="${meal.idMeal}">
                    View Recipe
                </button>

                <button class="add-meal-plan-btn"
                        data-name="${meal.strMeal}"
                        data-image="${meal.strMealThumb}">
                    Add to My Meal Plans
                </button>

            </div>
        `).join("");


        // Add Click Event to Each View Recipe Button
        result.querySelectorAll(".view-recipe-btn").forEach(button => {

            button.addEventListener("click", async () => {

                try {

                    const response = await fetch(
                        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${button.dataset.id}`
                    );

                    if (!response.ok) {
                        throw new Error("Recipe API request failed");
                    }

                    const detailData = await response.json();

                    const recipe = detailData.meals?.[0];

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


                    // Change to View Recipe Layout
                    result.classList.add("recipe-detail-view");


                    // Display Recipe Details
                    result.innerHTML = `
                        <div class="recipe-detail">

                            <div class="recipe-header">

                                <h2>${recipe.strMeal}</h2>

                                <img
                                    src="${recipe.strMealThumb}"
                                    alt="${recipe.strMeal}"
                                >

                            </div>


                            <div class="recipe-content">

                                <section class="ingredients-section">

                                    <h3>🥕 Ingredients</h3>

                                    <ul>
                                        ${ingredientsHTML}
                                    </ul>

                                </section>


                                <section class="instructions-section">

                                    <h3>🍳 Cooking Instructions</h3>

                                    <div class="instruction-box">

                                        ${(recipe.strInstructions || "Instructions unavailable.")
                                            .split(/\r?\n/)
                                            .filter(step => step.trim() !== "")
                                            .map((step, index) => `
                                                <div class="instruction-step">

                                                    <span class="step-number">
                                                        ${index + 1}
                                                    </span>

                                                    <p>
                                                        ${step.trim().replace(/^\d+[\.\)]\s*/, "")}
                                                    </p>

                                                </div>
                                            `).join("")}

                                    </div>

                                </section>

                            </div>

                        </div>
                    `;


                } catch (error) {

                    console.log(error);

                    alert("Failed to load recipe details.");

                }

            });

        });


        // Add Searched Recipe to My Meal Plans
        result.querySelectorAll(".add-meal-plan-btn").forEach(button => {

            button.addEventListener("click", () => {

                const selectedRecipe = {

                    name: button.dataset.name,

                    image: button.dataset.image

                };

                localStorage.setItem(
                    "selectedSuggestion",
                    JSON.stringify(selectedRecipe)
                );

                window.location.href = "mealplan.html";

            });

        });

    } catch (error) {

        console.log(error);

        result.innerHTML =
            "<h3>Failed to load recipe</h3>";

    }

});


// Recipe Suggestion
const suggestBtn = document.getElementById("suggestBtn");

suggestBtn.addEventListener("click", async () => {

    const category =
        document.getElementById("categoryInput").value;

    const suggestionResult =
        document.getElementById("suggestionResult");


    if (category === "") {

        suggestionResult.innerHTML =
            "<p>Please select a category.</p>";

        return;
    }


    try {

        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();


        if (!data.meals || data.meals.length === 0) {

            suggestionResult.innerHTML =
                "<p>No suitable recipes found.</p>";

            return;
        }


        let recommendationMessage = "";

        let suggestedMeal;


        // Select Recipe Based on Category
        switch (category) {

            case "Seafood":

                recommendationMessage =
                    "Recommended for seafood lovers!";

                suggestedMeal =
                    data.meals[data.meals.length - 1];

                break;


            case "Chicken":

                recommendationMessage =
                    "Recommended for chicken lovers!";

                suggestedMeal =
                    data.meals[0];

                break;


            case "Vegetarian":

                recommendationMessage =
                    "Recommended for vegetarian meals!";

                suggestedMeal =
                    data.meals[Math.floor(data.meals.length / 2)];

                break;


            case "Dessert":

                recommendationMessage =
                    "Recommended for dessert lovers!";

                suggestedMeal =
                    data.meals[data.meals.length > 1 ? 1 : 0];

                break;


            default:

                recommendationMessage =
                    "Here is your recipe suggestion!";

                suggestedMeal =
                    data.meals[0];

        }


        // Display Suggested Recipe
        suggestionResult.innerHTML = `

            <div class="recipe-card">

                <h3>Recommended Recipe</h3>

                <p>${recommendationMessage}</p>

                <img
                    src="${suggestedMeal.strMealThumb}"
                    alt="${suggestedMeal.strMeal}"
                    width="250"
                >

                <p>${suggestedMeal.strMeal}</p>

                <button id="saveSuggestedBtn">
                    Add to My Meal Plans
                </button>

            </div>

        `;


        // Save Suggested Recipe to My Meal Plans
        document.getElementById("saveSuggestedBtn")
            .addEventListener("click", () => {

                localStorage.setItem(
                    "selectedSuggestion",
                    JSON.stringify({

                        name: suggestedMeal.strMeal,

                        image: suggestedMeal.strMealThumb

                    })
                );

                window.location.href = "mealplan.html";

            });


    } catch (error) {

        console.log(error);

        suggestionResult.innerHTML =
            "<p>Failed to get recipe suggestions.</p>";

    }

});
