import { async } from "regenerator-runtime";
import { API_URL, RES_PER_PAGE , API_KEY} from "./config";
import { AJAX } from "./helpers";

export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
  },
  bookmarks: [],
};

const createRecipe = function(data){
    const { recipe } = data.data;
    return {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
      ...(recipe.key && {key : recipe.key})
    };
};

export const loadRecipe = async function (recipeID) {
  try {
    const data = await AJAX(`${API_URL}${recipeID}?key=${API_KEY}`);
    state.recipe = createRecipe(data);

    if (state.bookmarks.some((bookmark) => bookmark.id === state.recipe.id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

export const loadSearchRecipe = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    state.search.results = data.data.recipes.map((rec) => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && {key : rec.key})
      };
    });

    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * RES_PER_PAGE;
  const end = page * RES_PER_PAGE;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ing) => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmark = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // Adding the bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmark();
};

export const deleteBookmark = function (recipeId) {
  // Get the current index of the recipe
  const index = state.bookmarks.findIndex((el) => el.id === recipeId);
  // Remove the recipe from the bookmark array
  state.bookmarks.splice(index, 1);

  // Mark the recipe as unbookmarked
  if (recipeId === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmark();
};

const init = function () {
  const storage = localStorage.getItem("bookmarks");
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear("bookmarks");
};
// For development purposes

export const uploadRecipe = async function (userRecipe) {
  try{
    const ingredients = Object.entries(userRecipe).filter(
      (entry) => entry[0].startsWith("ingredient") && entry[1] !== ""
    ).map(ing => {
      const ingArr = ing[1].split(',').map(el => el.trim());
      if(ingArr.length !== 3){
        throw new Error('Wrong Ingredient format!! Please the correct format');
      }
      const [quantity,unit,description] = ingArr;
      if(description.length === 0){
        throw new Error("Please add a descritpion for the ingredient!!")
      }
      return {quantity : quantity ? +quantity : null,unit,description}
    })
  
    const userUpdatedRecipe = {
      title: userRecipe.title,
      publisher: userRecipe.publisher,
      source_url: userRecipe.sourceUrl,
      image_url: userRecipe.image,
      servings: +userRecipe.servings,
      cooking_time: +userRecipe.cookingTime,
      ingredients: ingredients,
    }
    const data = await AJAX(`${API_URL}?key=${API_KEY}`,userUpdatedRecipe)
    state.recipe = createRecipe(data)
    addBookmark(state.recipe)
  }
  catch(err){
    throw err;
  }
};
