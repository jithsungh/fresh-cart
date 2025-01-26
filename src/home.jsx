import React from "react";
import "./styles/home.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slideshow from "./slideshow";
import RecentlyOrdered from "./recently-ordered";
import Favourites from "./home-favourites";

/**
 * Home component that renders the home page of the application.
 * Displays recently ordered and favorite items.
 */
function Home() {
  
  

  return (
    <div className="Home">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Slideshow />
      <div className="home-recently-ordered">
        <h2>Recently Ordered</h2>
        <RecentlyOrdered />
      </div>
      <div className="favourites-items">
        <h2>Favourite Items</h2>
        <Favourites />
        
      </div>
    </div>
  );
}

export default Home;
