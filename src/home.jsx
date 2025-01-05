import React from "react";
import "./styles/home.css";
import { useUser } from "./UserContext"; // Import the UserContext
import { ToastContainer} from "react-toastify";

/**
 * Home component that renders the home page of the application.
 * Displays a welcome message to the user.
 */
function Home() {
  const { uid } = useUser(); // Access the user context

  const userId = uid;
  console.log(userId);

  // Render home page content if userId is available

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

      <h1>Welcome to Fresh Cart</h1>
    </div>
  );
}

export default Home;
