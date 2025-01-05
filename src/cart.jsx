import React, { useState, useEffect, useCallback } from "react";
import { incrementCartItem } from "./functions/incrementCartItem";
import { decrementCartItem } from "./functions/decrementCartItem";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/cart.css";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function Cart() {
  const { uid } = useUser();
  const userId = uid;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // To track loading state
  const [cartVisited, setCartVisited] = useState(false);
  const navigate = useNavigate();

  // Fetch items from Firestore
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true); // Start loading

      // Reference the user's cart subcollection
      const cartCollectionRef = collection(doc(db, "users", userId), "cart");
      const cartSnapshot = await getDocs(cartCollectionRef);

      if (cartSnapshot.empty) {
        console.log("Cart is empty.");
        setItems([]);
        return;
      }

      const itemsList = [];

      // Fetch item details for each item in the cart
      for (const cartDoc of cartSnapshot.docs) {
        const cartData = cartDoc.data();
        const itemId = cartData.item_id;

        if (itemId) {
          const itemDocRef = doc(db, "items", itemId);
          const itemDocSnapshot = await getDoc(itemDocRef);

          if (itemDocSnapshot.exists()) {
            itemsList.push({
              cartId: cartDoc.id, // Cart document ID
              ...cartData, // Data from the cart (e.g., quantity)
              ...itemDocSnapshot.data(), // Data from the items collection
            });
          } else {
            console.error(
              `Item with ID ${itemId} does not exist in the "items" collection.`
            );
          }
        } else {
          console.error("Cart item does not have an item_id field.");
        }
      }

      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false); // End loading
    }
  }, [userId]);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleIncrement = (userId, itemId, setItems) => {
    incrementCartItem(userId, itemId, setItems);
  };
  const handleDecrement = async (userId, itemId, setItems) => {
    decrementCartItem(userId, itemId, setItems);
  };
  const removeFromCart = async (userId, itemId, setItems) => {
    try {
      // Reference the parent document (user)
      const userDocRef = doc(db, "users", userId);

      // Reference the cart subcollection
      const cartCollectionRef = collection(userDocRef, "cart");

      // Query to find the item in the cart
      const q = query(cartCollectionRef, where("item_id", "==", itemId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If the item exists, delete it
        querySnapshot.forEach(async (docSnapshot) => {
          const existingDocRef = docSnapshot.ref;
          await deleteDoc(existingDocRef);

          toast(`Deleted item from the cart.`);

          // Update the state by removing the deleted item
          setItems((prevItems) =>
            prevItems.filter((item) => item.item_id !== itemId)
          );
        });
      } else {
        console.log(`Item ${itemId} not found in the cart.`);
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const calculateTotalPrice = (items) => {
    if (!items || items.length === 0) {
      return 0; // Return 0 if the cart is empty
    }
    let totalPrice = 0;

    items.map(
      (item) => (totalPrice += parseFloat(item.price) * parseInt(item.quantity))
    );

    return totalPrice;
  };
  const handleProceedToCheckout = () => {
    if (Object.keys(items).length === 0) {
      navigate("/cart"); // Redirect to cart page if empty
    } else {
      setCartVisited(true);
      navigate("/checkout", { state: { cartVisited } });
    }
  };
  if (loading) {
    return (
      <div className="loader">
        <img src="loading.gif" alt="loading" />
      </div>
    );
  }
  return (
    <>
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
      <div className="cart">
        <div className="cart-header">
          <div className="imgcard">
            <img src="./fcl.png" alt="" className="cartlogo" />
            <div className="title">Your Fresh Cart</div>
          </div>
          <div className="total">
            <div className="text">Cart Total </div>
            <div className="price">
              ₹{calculateTotalPrice(items).toFixed(2)}
            </div>
          </div>
          <button
            className="proceedtocheckout"
            onClick={() => handleProceedToCheckout()}
          >
            Proceed to Checkout
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-item-card">
            <h1 className="message">Your cart is empty</h1>
          </div>
        ) : (
          <div className="cart-container">
            {loading && (
              <div className="loader">
                <img src="loading.gif" alt="loading" />
              </div>
            )}
            <ToastContainer
              position="center-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            {items.map((item) => (
              <div key={item.item_id} className="cart-item-card">
                <div className="cart-images-container">
                  {item.images &&
                    item.images.map((image, index) =>
                      image ? (
                        <img
                          key={index}
                          src={image}
                          alt={`${item.item_name} ${index}`}
                          className="item-image"
                        />
                      ) : null
                    )}
                </div>
                <div className="cart-item-details">
                  <span className="name">{item.item_name}</span>
                  <span className="quantity">{item.grams} kg</span>
                  <div className="price">
                    <span className="cost">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </span>

                    {/*<span className="per-gram">
                    ₹{" "}
                    {(
                      (parseFloat(item.price) / parseFloat(item.grams)) *
                      100
                    ).toFixed(2)}
                    per kg
                  </span>*/}
                  </div>
                </div>
                <div className="cart-item-buttons">
                  <div className="edit-cart">
                    <button
                      className="decrement-quantity"
                      onClick={() =>
                        handleDecrement(userId, item.item_id, setItems)
                      }
                    >
                      -
                    </button>
                    <div className="quantity">{item.quantity}</div>
                    <button
                      className="increment-quantity"
                      onClick={() =>
                        handleIncrement(userId, item.item_id, setItems)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="delete"
                    onClick={() =>
                      removeFromCart(userId, item.item_id, setItems)
                    }
                  >
                    <i className="bx bx-trash"></i>
                  </button>
                </div>
                <div className="cart-item-total">
                  <span className="total">
                    ₹{parseFloat(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="cart-footer">
          <div className="imgcard">
            <img src="./fcl.png" alt="" className="cartlogo" />
            <div className="title">Your Fresh Cart</div>
          </div>
          <div className="total">
            <div className="text">Cart Total </div>
            <div className="price">
              ₹{calculateTotalPrice(items).toFixed(2)}
            </div>
          </div>
          <button
            className="proceedtocheckout"
            onClick={() => handleProceedToCheckout()}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default Cart;
