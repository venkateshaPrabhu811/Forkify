import View from "./View";
import previewView from "./previewView";

class sideBarView extends View {
  _parentElement = document.querySelector(".results");
  _errorMessage =
    "No recipes found for your query| Please try different recipe :)";
  _successMessage = "";

  _generateMarkup() {
    return this._data.map((res) => previewView.render(res,false)).join("");
  }
}

export default new sideBarView();
