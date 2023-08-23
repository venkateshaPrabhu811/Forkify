import icons from "url:../../img/icons.svg";

export default class View {
  _data;
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup()
    const newDom = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDom.querySelectorAll('*'));
    const currElements = Array.from(this._parentElement.querySelectorAll("*"));

    // Updates the changed text content
    newElements.forEach((newEle,i) =>{
      const curEle = currElements[i];
      if(!newEle.isEqualNode(curEle) && newEle.firstChild?.nodeValue.trim() !== ''){
        curEle.textContent = newEle.textContent;
      }

      if(!newEle.isEqualNode(curEle)){
        Array.from(newEle.attributes).forEach((attr) =>{
          curEle.setAttribute(attr.name,attr.value);
        })
      }
    })
  }
  /**
   * Render the received object into the DOM
   * @param {Object | Object[]} data The data to be rendered 
   * @param {boolean} [render=true] If false create the markup string instead of rendering into the DOM 
   * @returns {undefined | string} markup string returned if render = false
   * @this {Object} View instance
   */

  render(data,render = true) {
    if (!data || data.length === 0) return this.renderError();
    this._data = data;
    const recipeMarkup = this._generateMarkup();

    if(!render) return recipeMarkup;
    
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", recipeMarkup);
  }
  _clear() {
    this._parentElement.innerHTML = "";
  }
  renderError(message = this._errorMessage) {
    const errorMarkup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", errorMarkup);
  }

  renderSuccess(message = this._successMessage) {
    const errorMarkup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", errorMarkup);
  }

  renderSpinner() {
    const spinnerMarkup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    this._clear()
    this._parentElement.insertAdjacentHTML("afterbegin", spinnerMarkup);
  }
}
