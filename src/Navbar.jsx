import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext"; // Import the useUser hook
import logo from "./fcn.png";

const Navbar = () => {
  const { logout } = useUser(); // Get logout function from context
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleLogout = () => {
    logout(); // Call the logout function from UserContext
    navigate("/login"); // Redirect to login page after logout
  };

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
      <Link to="/favourites">
        <div className="Header-icon" id="wishlist" aria-label="Wishlist">
          <i className="bx bx-heart"></i>
        </div>
      </Link>

      <Link to="/cart">
        <div className="Header-icon" id="cart">
          <i className="bx bx-cart-alt"></i>
        </div>
      </Link>

      <div className="Header-icon" id="account" onClick={handleLogout}>
        <i className="bx bxs-user-circle"></i>
      </div>
    </header>
  );
};

export default Navbar;
