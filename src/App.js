import "./App.css";
import { useState, useEffect, startTransition } from "react";
import FirebaseAuthService from "./FirebaseAuthService";

import LoginForm from "./components/LoginForm";
import AddEditRecipeForm from "./components/AddEditRecipeForm";

import FirebaseFirestoreService from "./FirebaseFirestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    fetchRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes);
      })
      .catch((error) => {
        console.error(error.message);
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });


    // eslint-disable-next-line
  }, [user]);

  FirebaseAuthService.subscribeToAuthChanges(setUser);

  async function handleAddRecipe(newRecipe) {
    try {
      const response = await FirebaseFirestoreService.createDocument(
        "recipes",
        newRecipe
      );
      handleFetchRecipes();

      alert(`successfully create a recipe with an ID = ${response.id}`);
    } catch (error) {
      alert(error.message);

      throw error;
    }
  }

  async function fetchRecipes() {
    const queries = [];

    if (!user) {
      queries.push({
        field: "isPublished",
        condition: "==",
        value: true,
      });
    }
    let fetchedRecipes = [];
    try {
      const response = await FirebaseFirestoreService.readDocument({
        collection: "recipes",
        queries: queries,
      });
      const newRecipes = response.docs.map((recipeDoc) => {
        const id = recipeDoc.id;
        const data = recipeDoc.data();
        data.publishDate = new Date(data.publishDate.seconds * 1000);
        return { ...data, id };
      });
      fetchedRecipes = [...newRecipes];
    } catch (error) {
      console.error(error.message);
      throw error;
    }
    return fetchedRecipes;
  }

  async function handleFetchRecipes() {
    try {
      const fetchedRecipes = await fetchRecipes();

      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async function handleUpdateRecipe(newRecipe, recipeId) {
    try {
      await FirebaseFirestoreService.updateDocument(
        "recipes",
        recipeId,
        newRecipe
      );

      handleFetchRecipes();

      alert(`successfully updated a recipe with an ID = ${recipeId}`);
      setCurrentRecipe(null);
    } catch (error) {
      alert(error.message);
      throw error;
    }
  }
  function handleEditRecipeClick(recipeId) {
    const selectedRecipe = recipes.find((recipe) => {
      return recipe.id === recipeId;
    });

    if (selectedRecipe) {
      startTransition(() => {
 
      setCurrentRecipe(selectedRecipe);
      window.scrollTo(0, document.body.scrollHeight);
      })
    }
  }

  function handleEditRecipeCancel() {
    startTransition(() => {
    setCurrentRecipe(null);
  })
  }

  async function handleDeleteRecipe(recipeId) {
    const deleteConfirmtion = window.confirm(
      'Are you sure you want to delete this recipe? OK for Yes. Cancel for No.'
    );

    if (deleteConfirmtion) {
      try {
        await FirebaseFirestoreService.deleteDocument('recipes', recipeId);

        handleFetchRecipes();

        startTransition(() => {
          setCurrentRecipe(null);
        })

        window.scrollTo(0, 0);

        alert(`successfully deleted a recipe with an ID = ${recipeId}`);
      } catch (error) {
        alert(error.message);
        throw error;
      }
    }
  }


  function lookupCategoryLabel(categoryKey) {
    const categories = {
      breadsSandwichesAndPizza: "Breads, Sandwiches, and Pizza",
      eggsAndBreakfast: "Eggs & Breakfast",
      dessertsAndBakedGoods: "Desserts & Baked Goods",
      fishAndSeafood: "Fish & Seafood",
      vegetables: "Vegetables",
    };

    const label = categories[categoryKey];

    return label;
  }
  function formatDate(date) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${month}-${day}-${year}`;

    return dateString;
  }

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title"> Recipes</h1>
        <LoginForm existingUser={user} />
      </div>
      <div className="main">
        <div className="center">
          <div className="recipe-list-box">
          {isLoading ? (
              <div className="fire">
                <div className="flames">
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                </div>
                <div className="logs"></div>
              </div>
            ) : null}
            {!isLoading && recipes && recipes.length === 0 ? (
              <h5 className="no-recipes">No Recipes Found</h5>
            ) : null}
            {!isLoading && recipes && recipes.length > 0 ? (
              <div className="recipe-list">
                {recipes.map((recipe) => {
                  return (
                    <div className="recipe-card" key={recipe.id}>
                      {recipe.isPublished === false ? (
                        <div className="unpublished">UNPUBLISHED:</div>
                      ) : null}
                      <div className="recipe-name">{recipe.name}</div>
                      <div className="recipe-field">
                        Category: {lookupCategoryLabel(recipe.category)}
                      </div>
                      <div className="recipe-field">
                        Publish Date: {formatDate(recipe.publishDate)}
                      </div>
                      {user ? (
                        <button
                          type="button"
                          onClick={() => handleEditRecipeClick(recipe.id)}
                          className="primary-button edit-button"
                        >
                          EDIT
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        {user ? (
          <AddEditRecipeForm
            existingRecipe={currentRecipe}
            handleAddRecipe={handleAddRecipe}
            handleUpdateRecipe={handleUpdateRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
            handleEditRecipeCancel={handleEditRecipeCancel}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;
