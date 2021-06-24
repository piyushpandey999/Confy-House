// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartitem = document.querySelector(".cart-item");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".products");

// cart
let cart = [];
//buttons
let buttonsDOM = [];

//  getting the products
class Product {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let product = data.items;
      product = product.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return product;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(product) {
    let result = "";
    product.forEach((product) => {
      result += `
     
     <!--single products-->

     <article class="product1">
     <div class="img-container">
       <img
         src=${product.image}
         alt="image"
         class="product-img"
       />
     </div>
     <button class="shop-btn" data-id=${product.id}>
       <i class="fa fa-shopping-cart icon" aria-hidden="true"></i>
       Add to bag
     </button>
     <h3>${product.title}</h3>
     <h4>$${product.price}</h4>
   </article>

   <!--end of single products-->
     `;
    });
    productDOM.innerHTML = result;
  }
  getBagButtons() {
    const btns = [...document.querySelectorAll(".shop-btn")];
    buttonsDOM = btns;

    btns.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => {
        item.id === id;
      });
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get product from products
        let Cartitem = { ...Storage.getProducts(id), amount: 1 };

        //add products to the cart
        cart = [...cart, Cartitem];
        //save cart in local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartitem(Cartitem);
        //show the cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemstotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemstotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartitem.innerText = itemstotal;
    console.log(cartTotal, cartitem);
  }

  addCartitem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item1");
    div.innerHTML = `
    <img src=${item.image} alt="" />
    <div>
      <h4>${item.title}</h4>
      <h5>${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fa fa-chevron-up" aria-hidden="true" data-id=${item.id}></i>
      <p class="item-amount">1</p>
      <i class="fa fa-chevron-down" aria-hidden="true" data-id=${item.id}></i>
    </div> `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparent");
    cartDOM.classList.add("showCart");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartitem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparent");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    //clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    console.log(cartContent.children);

    while (cartContent.childElementCount.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);

    button.innerHTML = `
<i class="fa fa-shopping-cart"></i>add to cart
`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(product) {
    localStorage.setItem("products", JSON.stringify(product));
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  var ui = new UI();
  var product = new Product();
  //setup app
  ui.setupApp();

  // get all producsts
  product
    .getProducts()
    .then((product) => {
      ui.displayProducts(product);
      Storage.saveProducts(product);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
