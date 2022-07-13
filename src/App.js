import "./App.css";
import { useState, useEffect } from "react";
import FirebaseAuthService from "./FirebaseAuthService";

import LoginForm from "./components/LoginForm";
import AddEditRecipeForm from "./components/AddEditRecipeForm";

import FirebaseFirestoreService from "./FirebaseFirestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchRecipes()
      .then((fetchedRecipes) => {
        setRecipes(fetchedRecipes);
      })
      .catch((error) => {
        console.error(error.message);
        throw error;
      });
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
    let fetchedRecipes = [];
    try {
      const response = await FirebaseFirestoreService.readDocument('recipes');
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

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title"> Recipes</h1>
        <LoginForm existingUser={user} />
      </div>
      <div className="main">
        <div className="center">
          <div className="recipe-list-box">
            {recipes && recipes.length > 0 ? (
              <div className="recipe-list">
                {recipes.map((recipe) => {
                  return (
                    <div className="recipe-card" key={recipe.id}>
                      <div className="recipe-name">{recipe.name}</div>
                      <div className="recipe-field">Category: {recipe.category}</div>
                      <div className="recipe-field">Publish Date: {recipe.publishDate.toString()}</div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        {user ? <AddEditRecipeForm handleAddRecipe={handleAddRecipe} /> : null}
      </div>
    </div>
  );
}

export default App;
