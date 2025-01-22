import React, { useState, useEffect, useCallback } from "react";
import { incrementCartItem } from "./functions/incrementCartItem";
import { decrementCartItem } from "./functions/decrementCartItem";
import {
  doc,
  collection,
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

      // Fetch item details for each document in the cart
      for (const cartDoc of cartSnapshot.docs) {
        const cartData = cartDoc.data(); // Contains fields like quantity
        const itemId = cartDoc.id; // Document ID matches the itemId

        // Fetch the item details from the "items" collection
        const itemDocRef = doc(db, "items", itemId);
        const itemDocSnapshot = await getDoc(itemDocRef);

        if (itemDocSnapshot.exists()) {
          itemsList.push({
            itemId, // Cart document ID (same as itemId)
            ...cartData, // Data from the cart (e.g., quantity)
            ...itemDocSnapshot.data(), // Data from the items collection
          });
        } else {
          console.error(
            `Item with ID ${itemId} does not exist in the "items" collection.`
          );
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
      // Reference the specific cart document (using itemId as the document ID)
      const cartDocRef = doc(db, `users/${userId}/cart`, itemId);

      // Get the current cart item data
      const cartDocSnapshot = await getDoc(cartDocRef);

      if (cartDocSnapshot.exists()) {
        // If the item exists, delete it
        await deleteDoc(cartDocRef);

        toast(`Deleted item from the cart.`);

        // Update the state by removing the deleted item
        setItems((prevItems) =>
          prevItems.filter((item) => item.itemId !== itemId)
        );
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
      console.log("cart items: ", items);
      navigate("/checkout", {
        state: { checkoutItems: items, visited: true, backPath: "/cart" }, // Only pass serializable data
      });
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
                        handleDecrement(userId, item.itemId, setItems)
                      }
                    >
                      -
                    </button>
                    <div className="quantity">{item.quantity}</div>
                    <button
                      className="increment-quantity"
                      onClick={() =>
                        handleIncrement(userId, item.itemId, setItems)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="delete"
                    onClick={() =>
                      removeFromCart(userId, item.itemId, setItems)
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
