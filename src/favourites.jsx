import React, { useState, useEffect, useCallback } from "react";
import { incrementCartItem } from "./functions/incrementCartItem";
import { decrementCartItem } from "./functions/decrementCartItem";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/cart.css";
import { useUser } from "./UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Favourites() {
  const { uid } = useUser();
  const userId = uid;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // To track loading state
  const [cartItems, setCartItems] = useState([]);

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
              favouritesId: favouritesDoc.id, // Favourites document ID
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

  const addToCart = async (userId, itemId, setCartItems) => {
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

        // Update the cartItems state directly
        setCartItems((prevCartItems) => [
          ...prevCartItems,
          { itemId, ...itemData },
        ]);

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

      const querySnapshot = await getDocs(favouritesDocRef);

      if (querySnapshot.exists()) {
        querySnapshot.forEach(async (docSnapshot) => {
          const existingDocRef = docSnapshot.ref;
          await deleteDoc(existingDocRef);
          toast(`Item deleted from favourites.`);
        });
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } else {
        console.log(`Item ${itemId} not found in favourites.`);
      }
    } catch (error) {
      console.error("Error removing item from favourites:", error);
    }
  };
  if (loading) {
    return (
      <div className="loader">
        <img src="loading.gif" alt="loading" />
      </div>
    );
  }

  const handleIncrement = (userId, itemId, setCartItems) => {
    incrementCartItem(userId, itemId, setCartItems);
  };

  const handleDecrement = async (userId, itemId, setCartItems) => {
    decrementCartItem(userId, itemId, setCartItems);
  };

  return (
    <div className="shop-container">
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
      {items.map((item) => {
        const isItemInCart = cartItems.some(
          (cartItem) => cartItem.itemId === item.item_id
        );
        const cartItem = cartItems.find(
          (cartItem) => cartItem.itemId === item.item_id
        );

        return (
          <div key={item.id} className="item-card">
            <div className="images-container">
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
            <div className="item-details">
              <span className="name">{item.item_name}</span>
              <span className="description">{item.item_description}</span>

              <div className="price">
                <span className="cost">
                  <del>₹{parseInt(item.price + item.price * 0.25)}</del> ₹
                  {parseInt(item.price)}
                </span>
                <span className="quantity">{item.grams} kg</span>
                {/*<span className="per-gram">
                  ₹
                  {(
                    (parseFloat(item.price) / parseFloat(item.grams)) *
                    100
                  ).toFixed(2)}{" "}
                  per 100g
                </span>*/}
              </div>
              <div className="item-buttons">
                <button
                  className="favourite"
                  onClick={() =>
                    removeFromFavorites(userId, item.item_id, setItems)
                  }
                >
                  <i className="bx bxs-heart"></i>
                </button>
                {!isItemInCart ? (
                  <button
                    className="addtocart"
                    onClick={() => addToCart(userId, item.item_id)}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="edit-cart">
                    <button
                      className="decrement-quantity"
                      onClick={() =>
                        handleDecrement(userId, item.item_id, setCartItems)
                      }
                    >
                      -
                    </button>
                    <div className="quantity">{cartItem.quantity}</div>
                    <button
                      className="increment-quantity"
                      onClick={() =>
                        handleIncrement(userId, item.item_id, setCartItems)
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

export default Favourites;
