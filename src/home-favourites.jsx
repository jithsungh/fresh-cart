import React, { useState, useEffect, useCallback, useRef } from "react";
import { incrementCartItem } from "./functions/incrementCartItem";
import { decrementCartItem } from "./functions/decrementCartItem";
import {
  doc,
  collection,
  getDocs,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/home-favourites.css";
import { useUser } from "./UserContext";
import { toast } from "react-toastify";
import PoAddToList from "./poAddToList";
import "react-toastify/dist/ReactToastify.css";

function Favourites() {
  const { uid } = useUser();
  const userId = uid;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // To track loading state
  const [cartItems, setCartItems] = useState([]);

  const [addToList, setAddToList] = useState(false);

  const [popupStyle, setPopupStyle] = useState({});
  const [selectedItemId, setSelectedItemId] = useState(null); // Track selected item ID
  const buttonRefs = useRef({});

  // Fetch items from Firestore
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true); // Start loading
      console.log("Fetching favourites...");

      // Reference the user's favourites subcollection
      const favouritesCollectionRef = collection(
        doc(db, "users", userId), // Use `userId` variable
        "favourites"
      );

      const favouritesSnapshot = await getDocs(favouritesCollectionRef);

      if (favouritesSnapshot.empty) {
        console.log("Favourites is empty.");
        setItems([]);
        return;
      }

      const itemsList = [];
      console.log("Favourites snapshot size:", favouritesSnapshot.size);

      // Fetch item details for each item in the favourites
      for (const favouritesDoc of favouritesSnapshot.docs) {
        const itemId = favouritesDoc.id;

        if (itemId) {
          console.log(`Fetching details for item ID: ${itemId}`);
          const itemDocRef = doc(db, "items", itemId);
          const itemDocSnapshot = await getDoc(itemDocRef);

          if (itemDocSnapshot.exists()) {
            console.log(`Item found: ${itemDocSnapshot.id}`);
            itemsList.push({
              id: favouritesDoc.id, // Favourites document ID
              ...itemDocSnapshot.data(), // Data from the items collection
            });
          } else {
            console.error(
              `Item with ID ${itemId} does not exist in the "items" collection.`
            );
          }
        } else {
          console.error("Favourite item does not have an item_id field.");
        }
      }

      console.log("Fetched items:", itemsList);
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching favourites items:", error);
    } finally {
      setLoading(false); // End loading
      console.log("Fetching process completed.");
    }
  }, [userId]);

  const fetchCartItems = useCallback(async () => {
    try {
      // Reference the cart subcollection
      const cartCollectionRef = collection(doc(db, "users", userId), "cart");
      const querySnapshot = await getDocs(cartCollectionRef);

      const cartList = querySnapshot.docs.map((doc) => ({
        itemId: doc.id, // Use document ID as the item ID
        ...doc.data(), // Include quantity and other fields
      }));

      setCartItems(cartList); // Update state with the fetched cart items
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  }, [userId]);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
    fetchCartItems();
  }, [fetchItems, fetchCartItems]);

  const addToCart = async (userId, itemId) => {
    const itemData = {
      quantity: 1, // Default quantity
    };

    try {
      // Reference the user's cart collection
      const cartDocRef = doc(db, `users/${userId}/cart`, itemId); // Use itemId as the document ID

      // Check if the item already exists in the cart
      const docSnapshot = await getDoc(cartDocRef);

      if (!docSnapshot.exists()) {
        // Item does not exist, create a new document
        await setDoc(cartDocRef, itemData);

        fetchCartItems();

        toast.success(`Added new item ${itemId} to cart.`);
      }
    } catch (error) {
      console.error("Error adding or updating item:", error);
      toast.error("Failed to add or update item in cart.");
    }
  };
  const removeFromFavorites = async (userId, itemId, setItems) => {
    try {
      const favouritesDocRef = doc(db, `users/${userId}/favourites`, itemId);

      const docSnapshot = await getDoc(favouritesDocRef);

      if (docSnapshot.exists()) {
        // If the item exists, delete it from favourites
        await deleteDoc(favouritesDocRef);
        toast(`Item removed from favourites.`);

        // Update the items state directly
        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );

      } else {
        console.log(`Item ${itemId} not found in favourites.`);
      }
    } catch (error) {
      console.error("Error removing item from favourites:", error);
    }
  };

  const handleIncrement = (userId, itemId, setCartItems) => {
    incrementCartItem(userId, itemId, setCartItems);
  };

  const handleDecrement = async (userId, itemId, setCartItems) => {
    decrementCartItem(userId, itemId, setCartItems);
  };

  const showPopup = (itemId) => {
    const button = buttonRefs.current[itemId];
    if (button) {
      const rect = button.getBoundingClientRect();
      // Calculate popup position relative to the viewport
      const style = {
        top: rect.bottom + window.scrollY + 10 + "px", // 10px below the button
        left: rect.left + window.scrollX - 150 + "px", // Align with the left edge of the button
      };
      setPopupStyle(style); // Update the popup position
      setSelectedItemId(itemId);
      setAddToList(true); // Show the popup
    }
  };
  const hidePopup = () => {
    setAddToList(false); // Hide the popup
  };


  return (
    <div className="favourites-container">
      {loading && (
        <div className="loader">
          <img src="loading.gif" alt="Loading..." />
        </div>
      )}
      {addToList && (
        <div
          id="popup"
          style={{
            position: "absolute",
            ...popupStyle, // Apply calculated position
            backgroundColor: "#fff",
            padding: "5px",
            borderRadius: "50%",
            zIndex: 1000000,
          }}
        >
          <PoAddToList onClose={hidePopup} itemId={selectedItemId} />
        </div>
      )}
      <div className="favourite-items">
        {items.map((item) => {
          const isItemInCart = cartItems.some(
            (cartItem) => cartItem.itemId === item.id
          );
          const cartItem = cartItems.find(
            (cartItem) => cartItem.itemId === item.id
          );

          return (
            <div key={item.id} className="item-card">
              {/* Image Section */}
              <div className="images-container">
                <div className="image-wrapper">
                  <i
                    id="plus-button"
                    className="bx bxs-bookmark-alt-plus"
                    title="Add to List"
                    ref={(el) => (buttonRefs.current[item.id] = el)} // Assign dynamic ref
                    onClick={() => showPopup(item.id)}
                  ></i>
                  {item.images &&
                    item.images.map(
                      (image, index) =>
                        image && (
                          <img
                            key={index}
                            src={image}
                            alt={`${item.item_name} ${index}`}
                            className="item-image"
                          />
                        )
                    )}
                </div>
              </div>

              {/* Item Details */}
              <div className="item-details">
                <span className="name">{item.item_name}</span>
                <span className="description">{item.item_description}</span>
                <div className="price">
                  <span className="cost">
                    <del>₹{parseInt(item.price + item.price * 0.25)}</del> ₹
                    {parseInt(item.price)}
                  </span>
                  <span className="quantity">({item.grams} kg)</span>
                </div>

                {/* Action Buttons */}
                <div className="item-buttons">
                  {/* Favourite Button */}
                  <button
                    className="favourite"
                    onClick={() =>
                      removeFromFavorites(userId, item.id, setItems)
                    }
                  >
                    <i className="bx bxs-heart"></i>
                  </button>

                  {/* Cart Buttons */}
                  {!isItemInCart ? (
                    <button
                      className="addtocart"
                      onClick={() => addToCart(userId, item.id)}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="edit-cart">
                      <button
                        className="decrement-quantity"
                        onClick={() =>
                          handleDecrement(userId, item.id, setCartItems)
                        }
                      >
                        -
                      </button>
                      <div className="quantity">{cartItem.quantity}</div>
                      <button
                        className="increment-quantity"
                        onClick={() =>
                          handleIncrement(userId, item.id, setCartItems)
                        }
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Favourites;
