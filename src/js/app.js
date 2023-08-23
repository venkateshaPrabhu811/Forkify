import { async } from "regenerator-runtime";
import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import sideBarView from "./views/sideBarView.js";
import PaginationView from "./views/PaginationView.js";
import bookmarkView from "./views/bookmarkView.js";
import addRecipeView from "./views/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    // Getting the id from the hash
    const recipeID = window.location.hash.slice(1);
    // Guard Class
    if (!recipeID) return;
    // Loading Spinner
    recipeView.renderSpinner();

    // Updating the mark in the bookmark view as well
    bookmarkView.update(model.state.bookmarks)

    // Update the mark on the selected recipe
    sideBarView.update(model.getSearchResultsPage());

    // Loading recipe from the api
    await model.loadRecipe(recipeID);

    // Rendering the recipe in the web page
    recipeView.render(model.state.recipe);

  } catch (error) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    sideBarView.renderSpinner();
    // Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // Load the query results in the state
    await model.loadSearchRecipe(query);
    
    // Render the query results in the side bar results page
    sideBarView.render(model.getSearchResultsPage()); 

    // Render initial Pagination View
    PaginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // Render the currPage results
  sideBarView.render(model.getSearchResultsPage(goToPage));

  // Render new Pagination View
  PaginationView.render(model.state.search);
};

const controlServings = function(servings){
  // Update the recipe servings (in state)
  model.updateServings(servings)

  // Update the recipe View
  recipeView.update(model.state.recipe)
}

const controlAddBookamrk = function(){
  // Add or remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)

  // Render the recipe with the updated bookmark
  recipeView.update(model.state.recipe);

  // Render the bookmark notification
  controlBookmarks()
}

const controlBookmarks = function(){
  bookmarkView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
  // Upload the user recipe Data
  try{
    // Render the spinner
    addRecipeView.renderSpinner()

    await model.uploadRecipe(newRecipe);

    // render the added recipe
    recipeView.render(model.state.recipe)

    // Success Message
    addRecipeView.renderSuccess();

    // Update the bookmarkView
    controlBookmarks();

    // Change id in URL
    window.history.pushState(null,'',`#${model.state.recipe.id}`)

    // Close form window
    setTimeout(() => addRecipeView.toggleWindow(),MODAL_CLOSE_SEC*1000)

    window.location.reload()
  }
  catch(err){
    addRecipeView.renderError(err);
  }
}

const init = function () {
  bookmarkView.addHandlerBookmark(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookamrk);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  searchView.addSearchHandler(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
};
init();
