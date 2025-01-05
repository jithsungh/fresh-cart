import React, { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase-config"; // Import the initialized Firestore instance
import "./styles/orderplaced.css";
import { useLocation, useNavigate } from "react-router-dom";

const OrderPlaced = () => {
  const location = useLocation();



  
  const navigate = useNavigate();

  const { orderId } = location.state || {};
  const [orderData, setOrderData] = useState(null);

  // Redirect to /cart if orderId is not present

  const fetchOrderData = useCallback(async () => {
    try {
      const orderDocRef = doc(db, "orders", orderId);
      const orderDocSnapshot = await getDoc(orderDocRef);
      if (orderDocSnapshot.exists()) {
        setOrderData(orderDocSnapshot.data());
      } else {
        console.log("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  }, [orderId]);
  useEffect(() => {
    if (!orderId) {
      navigate("/cart");
    } else {
      // Simulate fetching order data or perform other logic
      fetchOrderData(orderId);
    }
  }, [orderId, navigate, fetchOrderData]);

  useEffect(() => {
    fetchOrderData();
    console.log(orderData);
  }, [fetchOrderData, orderData]);

  const handleContinueShopping = () => {
    navigate("/shop");
  };

  return (
    <div className="order-placed-container">
      <div className="order-placed-message">
        <h1>Congratulations! 🎉</h1>
        <p>Your order has been placed successfully.</p>
        <p>
          <strong>Order ID:</strong> <i>{orderId}</i>
        </p>
        <p className="detail">
          We are working on your order. You will receive it by tomorrow!
        </p>
        <button
          className="continue-shopping-btn"
          onClick={handleContinueShopping}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderPlaced;
