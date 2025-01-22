import React, { useState, useEffect, useCallback } from "react";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db } from "./firebase-config"; // Import the initialized Firestore instance
import "./styles/orders.css";
import { useUser } from "./UserContext";
import { ToastContainer, toast } from "react-toastify";
import { createNewListWithItems } from "./functions/listFunctions";
import { Button, TextField } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { uid } = useUser();
  const userId = uid;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const userOrdersRef = collection(doc(db, "users", userId), "orders");
      const userOrdersSnapshot = await getDocs(userOrdersRef);

      const orderIds = userOrdersSnapshot.docs.map(
        (doc) => doc.data().order_id
      );

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

  const handleOpenPopup = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setNewListName("");
    setSelectedOrder(null);
  };

  const handleCreateNewList = async () => {
    try {
      if (!newListName.trim()) {
        toast.error("Please enter a list name.");
        return;
      }

      // Map the ordered items to an object with item_id as the key and quantity as the value
      const itemData = Object.entries(selectedOrder.ordered_items).reduce((acc, [itemKey, itemDetails]) => {
        acc[itemKey] = { quantity: itemDetails.quantity }; // Retain the existing format
        return acc;
      }, {});

      // Now itemData is an object, not an array of JSX elements
      // Example: { "beetroot500": { quantity: 1 }, "broccoli500": { quantity: 1 }, ... }

      // Call the function to create a new list with the items
      const listId = await createNewListWithItems(
        userId,
        newListName,
        itemData
      );

      // Close the popup after the operation is complete
      console.log("New list created with ID:", listId);
      handleClosePopup();
    } catch (error) {
      console.error("Error creating new list:", error);
    }
  };

  const handleRepeatOrder = async (order) => {
    if (Object.keys(order.ordered_items).length === 0) {
      navigate("/orders"); // Redirect to orders page if empty
      return;
    }

    const itemsList = [];
    console.log("Order details: ", order);

    // Loop through each item in the ordered_items
    for (const [itemId, itemDetails] of Object.entries(order.ordered_items)) {
      const { quantity } = itemDetails;

      // Fetch the item details from the "items" collection
      const itemDocRef = doc(db, "items", itemId);
      const itemDocSnapshot = await getDoc(itemDocRef);

      if (itemDocSnapshot.exists()) {
        const itemData = itemDocSnapshot.data();
        // Add the item data along with its quantity from the order
        itemsList.push({
          itemId,
          quantity,
          ...itemData, // Merge item details from the "items" collection
        });
      } else {
        console.error(
          `Item with ID ${itemId} does not exist in the "items" collection.`
        );
      }
    }
    // Navigate to checkout page with serialized data
    navigate("/checkout", {
      state: { checkoutItems: itemsList, visited: true, backPath: "/orders" },
    });
  };

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
          <div className="header">
            <div className="box1">
              <h3>
                Order ID: <i>{order.id}</i>
              </h3>
              <p>
                <strong>Status:</strong> Unavailable
              </p>
            </div>
            <div className="buttons">
              <Button
                variant="contained"
                color="success"
                onClick={() => handleRepeatOrder(order)}
              >
                Repeat order
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenPopup(order)}
              >
                Create a new list
              </Button>
            </div>
          </div>
          <table className="order-table">
            <tbody>
              <tr>
                <td>
                  <strong>Date:</strong>
                </td>
                <td>{new Date(order.date.toDate()).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td>
                  <strong>Time:</strong>
                </td>
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
              {Object.entries(order.ordered_items).map(
                ([itemKey, itemValue], index) => (
                  <tr key={index}>
                    <td>{itemKey}</td>
                    <td>{itemValue.quantity}</td>{" "}
                    {/* Access the quantity property */}
                  </tr>
                )
              )}
              <tr>
                <td>
                  <strong>Total Amount:</strong>
                </td>
                <td>
                  <strong>₹ {order.total}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h1 className="title">Create new List</h1>
              <i id="close" className="bx bx-x" onClick={handleClosePopup}></i>
            </div>
            <section className="new-list-order">
              <TextField
                label="List Name"
                variant="outlined"
                size="small"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateNewList}
              >
                Create
              </Button>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
