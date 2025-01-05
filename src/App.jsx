import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import { UserProvider } from "./UserContext"; // Import the UserProvider

import Login from "./login";
import Signup from "./signup";
import Navbar from "./Navbar";
import Home from "./home"; // Home is now public
import Shop from "./shop";
import Orders from "./orders";
import Cart from "./cart";
import Checkout from "./checkout";
import Favourites from "./favourites";
import OrderPlaced from "./orderplaced";

import "./styles/App.css";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <UserProvider>
      <div className="App">
        <div className="body">
          <BrowserRouter>
            <Navbar />
            <div className="container">
              <Routes>
                {/* Home is now a public route */}
                <Route path="/home" element={<Home />} />
                <Route path="/" element={<Home />} />

                {/* Protected Routes */}
                <Route
                  path="/shop"
                  element={
                    <ProtectedRoute>
                      <Shop />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favourites"
                  element={
                    <ProtectedRoute>
                      <Favourites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orderplaced"
                  element={
                    <ProtectedRoute>
                      <OrderPlaced />
                    </ProtectedRoute>
                  }
                />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </div>
          </BrowserRouter>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
