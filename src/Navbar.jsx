import React from "react";
import { Link} from "react-router-dom";
import logo from "./fcn.png";

const Navbar = () => {

  
  return (
    <header className="Header">
      <img src={logo} className="Header-logo" alt="logo" />

      <input
        type="text"
        className="Header-searchbar"
        placeholder="Search Fresh Cart"
      />
      <div className="Header-search">
        <i className="bx bx-search"></i>
      </div>

      <div className="buttons">
        <Link to="/">
          <button className="Header-button">Home</button>
        </Link>
        <Link to="/shop">
          <button className="Header-button">Shop</button>
        </Link>
        <Link to="/orders">
          <button className="Header-button">Orders</button>
        </Link>
      </div>
      <Link to="/lists">
        <div className="Header-icon" id="lists" title="Lists">
          <i className="bx bxs-receipt"></i>
        </div>
      </Link>
      <Link to="/favourites">
        <div className="Header-icon" id="wishlist" title="Wishlist" aria-label="Wishlist">
          <i className="bx bx-heart"></i>
        </div>
      </Link>

      <Link to="/cart">
        <div className="Header-icon" id="cart" title="Cart">
          <i className="bx bx-cart-alt"></i>
        </div>
      </Link>
      <Link to="/account">
        <div className="Header-icon" id="account" title="Account">
          <i className="bx bxs-user-circle"></i>
        </div>
      </Link>
    </header>
  );
};

export default Navbar;
