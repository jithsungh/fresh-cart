import React, { useState, useEffect, useCallback } from "react";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db } from "./firebase-config"; // Import the initialized Firestore instance
import "./styles/orders.css";
import { useUser } from "./UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { uid } = useUser();
  const userId = uid;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const userOrdersRef = collection(doc(db, "users", userId), "orders");
      const userOrdersSnapshot = await getDocs(userOrdersRef);

      const orderIds = userOrdersSnapshot.docs.map((doc) => doc.data().order_id);

      const orderDetails = await Promise.all(
        orderIds.map(async (orderId) => {
          const orderDocRef = doc(db, "pending_orders", orderId);
          const orderDocSnapshot = await getDoc(orderDocRef);
          if (orderDocSnapshot.exists()) {
            return { id: orderId, ...orderDocSnapshot.data() };
          }
          return null;
        })
      );

      const sortedOrders = orderDetails
        .filter((order) => order !== null)
        .sort((a, b) => b.date.toDate() - a.date.toDate());

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId, fetchOrders]);

  if (orders.length === 0 && !loading) {
    return (
      <div className="no-orders">
        Sorry, you don't have any orders.
        <button onClick={() => navigate("/shop")}>Continue to shop</button>
      </div>
    );
  }

  return (
    <div className="orders-container">
      {loading && (
        <div className="loader">
          <img src="loading.gif" alt="loading" />
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <h3>
            Order ID: <i>{order.id}</i>
          </h3>
          <p>
            <strong>Status:</strong> Unavailable
          </p>
          <table className="order-table">
            <tbody>
              <tr>
                <td><strong>Date:</strong></td>
                <td>{new Date(order.date.toDate()).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Time:</strong></td>
                <td>{new Date(order.date.toDate()).toLocaleTimeString()}</td>
              </tr>
            </tbody>
          </table>
          <div className="spacer"></div>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {order.ordered_items.map((item, index) => (
                <tr key={index}>
                  <td>{item.item_id}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
              <tr>
                <td><strong>Total Amount:</strong></td>
                <td><strong>₹ {order.total}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Orders;
