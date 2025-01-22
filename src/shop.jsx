import React, { useCallback, useEffect, useState, useRef } from "react";
import { incrementCartItem } from "./functions/incrementCartItem";
import { decrementCartItem } from "./functions/decrementCartItem";
import {
  doc,
  collection,
  query,
  where,
  setDoc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/shop.css";
import { useUser } from "./UserContext"; // Import UserContext
import { ToastContainer, toast } from "react-toastify";
import PoAddToList from "./poAddToList";
import "react-toastify/dist/ReactToastify.css";

function Shop() {
  const { uid } = useUser(); // Access the user from UserContext
  const userId = uid; // Check if user is null or undefined

  // State hooks should be defined before any return statements
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favouritesItems, setFavouritesItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addToList, setAddToList] = useState(false);

  const [popupStyle, setPopupStyle] = useState({});
  const [selectedItemId, setSelectedItemId] = useState(null); // Track selected item ID
  const buttonRefs = useRef({});
  // Fetch items from Firestore
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsList = [];
      querySnapshot.forEach((doc) => {
        itemsList.push({ id: doc.id, ...doc.data() });
      });
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart items
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

  // Fetch favourite items
  const fetchFavouritesItems = useCallback(async () => {
    try {
      const favouritesCollectionRef = collection(
        doc(db, "users", userId),
        "favourites"
      );
      const querySnapshot = await getDocs(favouritesCollectionRef);
      const favouritesList = [];
      querySnapshot.forEach((doc) => {
        favouritesList.push(doc.id); // Store only the item IDs
      });
      setFavouritesItems(favouritesList);
    } catch (error) {
      console.error("Error fetching favourite items:", error);
    }
  }, [userId]);

  const addToFavourite = useCallback(
    async (userId, itemId) => {
      try {
        // Reference the specific favourite item document
        const favouritesDocRef = doc(db, `users/${userId}/favourites`, itemId);

        // Check if the item exists in favourites
        const docSnapshot = await getDoc(favouritesDocRef);

        if (docSnapshot.exists()) {
          // If the item exists, delete it from favourites
          await deleteDoc(favouritesDocRef);
          toast(`Item removed from favourites.`);
        } else {
          // If the item does not exist, add it to favourites
          await setDoc(favouritesDocRef, { itemId });
          toast(`Item added to favourites.`);
        }

        // Fetch updated favourites list
        fetchFavouritesItems();
      } catch (error) {
        console.error("Error adding or removing favourite:", error);
        toast.error("Failed to update favourites.");
      }
    },
    [fetchFavouritesItems]
  );

  const handleIncrement = (userId, itemId, setCartItems) => {
    incrementCartItem(userId, itemId, setCartItems);
  };

  const handleDecrement = async (userId, itemId, setCartItems) => {
    decrementCartItem(userId, itemId, setCartItems);
  };
  // ADD TO CART
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

  // UseEffect should be used unconditionally
  useEffect(() => {
    if (userId) {
      fetchItems();
      fetchCartItems();
      fetchFavouritesItems();
    }
  }, [fetchCartItems, fetchFavouritesItems, fetchItems, userId]);

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
    <div className="shop-container">
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
      {items.map((item) => {
        const isItemInCart = cartItems.some(
          (cartItem) => cartItem.itemId === item.id
        );
        const isItemInFavourites = favouritesItems.includes(item.id);
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
                  title="Add to Favourites"
                  onClick={() => addToFavourite(userId, item.id)}
                >
                  <i
                    className={
                      isItemInFavourites ? "bx bxs-heart" : "bx bx-heart"
                    }
                  ></i>
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
  );
}

export default Shop;
