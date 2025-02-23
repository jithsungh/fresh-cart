import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "./fcn.png";

const Navbar = () => {
  
  const showMenu = () => {
    var burger = document.getElementById("burger");
    var cross = document.getElementById("cross");
    burger.classList.add("hidden");
    cross.classList.remove("hidden");
    var x = document.getElementById("menu");
    x.classList.remove("hidden");
    x.classList.add("flex");
  };
  const hideMenu = () => {
    var burger = document.getElementById("burger");
    var cross = document.getElementById("cross");
    cross.classList.add("hidden");
    burger.classList.remove("hidden");

    var x = document.getElementById("menu");
    x.classList.remove("flex");
    x.classList.add("hidden");
  };
  const handleClick = (id) => {
    const list = [
      "home",
      "shop",
      "orders",
      "lists",
      "cart",
      "wishlist",
      "account",
    ];

    for (let i = 0; i < list.length; i++) {
      var x = document.getElementById(list[i]);
      x.classList.remove("border-green-600");
      x.classList.add("border-transparent");
    }
    var x = document.getElementById(id);
    x.classList.remove("border-transparent");
    x.classList.add("border-green-600");

    hideMenu();
  };

  return (
    <header className="text-gray-700 t-0 l-0 px-2  flex items-center justify-between bg-gray-100 border-b-2 border-green-600 gap-2 md:px-5 md:gap-5 lg:gap-10 xl:px-10">
      <Link to="/" className="py-2">
        <img src={logo} className="h-10" alt="logo" />
      </Link>
      <div className="py-2 flex items-center gap-3 justify-end md:gap-10 lg:flex-1 lg:justify-between">
        <div className="flex relative items-center border-gray-400 border-2 rouded-lg rounded-full p-1  h-8 w-8  sm:w-80 sm:pr-2 sm:pl-4 md:w-100 md:pr-2 md:pl-4 lg:w-120">
          <input
            type="text"
            className="hidden sm:w-60 sm:block md:w-80 flex-1 border-none focus:outline-none  placeholder:text-gray-400 placeholder:text-sm  "
            placeholder="Search Fresh Cart"
          ></input>
          <svg
            className="w-8 m-1 absolute rounded-full right-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
        <div id="burger" className="block xl:hidden" onClick={showMenu}>
          <svg
            className="w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </div>

        <div id="cross" className="hidden xl:hidden" onClick={hideMenu}>
          <svg
            className="w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>

      <div
        id="menu"
        className="py-2 top-15 right-0 h-full z-10000 hidden bg-gray-200 pr-10 gap-5 absolute items-start flex-col xl:p-0 xl:gap-10 xl:bg-transparent xl:flex xl:top-0 xl:relative xl:flex-row xl:justify-evenly"
      >
        <Link
          id="home"
          className="flex pl-3 xl:pl-0 justify-center border-transparent border-l-5 xl:border-0"
          to="/"
          onClick={() => handleClick("home")}
        >
          <div className="xl:hidden mr-2 ">
            <i className="bx bxs-home"></i>
          </div>
          <button className="border-0 bg-transparent font-bold">Home</button>
        </Link>
        <Link
          id="shop"
          className="flex pl-3 xl:pl-0 justify-center border-transparent border-l-5 xl:border-0"
          to="/shop"
          onClick={() => handleClick("shop")}
        >
          <div className="xl:hidden mr-2 ">
            <i className="bx bxs-store"></i>
          </div>
          <button className="border-0 bg-transparent font-bold">Shop</button>
        </Link>
        <Link
          id="orders"
          className="flex pl-3 xl:pl-0 justify-center border-transparent border-l-5 xl:border-0"
          to="/orders"
          onClick={() => handleClick("orders")}
        >
          <div className="xl:hidden mr-2 ">
            <i className="bx bxs-package"></i>
          </div>
          <button className="border-0 bg-transparent font-bold">Orders</button>
        </Link>

        <Link
          id="lists"
          className="flex pl-3 xl:pl-0 justify-center border-transparent border-l-5 xl:border-0"
          to="/lists"
          onClick={() => handleClick("lists")}
        >
          <div className="font-bold mr-2 ">
            <i className="bx bxs-receipt"></i>
          </div>
          <button
            className="border-0 bg-transparent font-bold xl:hidden"
            id="lists"
            title="Lists"
          >
            Lists
          </button>
        </Link>
        <Link
          id="wishlist"
          className="flex pl-3 xl:pl-0 justify-center border-transparent border-l-5 xl:border-0"
          to="/favourites"
          onClick={() => handleClick("wishlist")}
        >
          <div className="font-bold mr-2 ">
            <i className="bx bxs-heart"></i>
          </div>
          <button
            className="border-0 bg-transparent font-bold xl:hidden"
            id="wishlist"
            title="Wishlist"
            aria-label="Wishlist"
          >
            Favourites
          </button>
        </Link>

        <Link
          id="cart"
          className="flex pl-3 xl:pl-0 justify-center border-transparent border-l-5 xl:border-0"
          to="/cart"
          onClick={() => handleClick("cart")}
        >
          <div className="font-bold mr-2 ">
            <i className="bx bxs-cart-alt"></i>
          </div>
          <button
            className="border-0 bg-transparent font-bold xl:hidden"
            id="cart"
            title="Cart"
          >
            Cart
          </button>
        </Link>
        <Link
          id="account"
          className="flex pl-3 xl:pl-0 justify-center border-transparent border-l-5 xl:border-0"
          to="/account"
          onClick={() => handleClick("account")}
        >
          <div className="font-bold mr-2 ">
            <i className="bx bxs-user-circle"></i>
          </div>
          <button
            className="border-0 bg-transparent font-bold xl:hidden"
            id="account"
            title="Account"
          >
            Account
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
