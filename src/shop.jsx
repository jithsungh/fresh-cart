import React, { useCallback, useEffect, useState } from "react";
import { incrementCartItem } from "./functions/incrementCartItem";
import { decrementCartItem } from "./functions/decrementCartItem";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/shop.css";
import { useUser } from "./UserContext"; // Import UserContext
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Shop() {
  const { uid } = useUser(); // Access the user from UserContext
  const userId = uid; // Check if user is null or undefined

  // State hooks should be defined before any return statements
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favouritesItems, setFavouritesItems] = useState([]);
  const [loading, setLoading] = useState(false);

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
    }finally{
      setLoading(false);
    }
  }, []);

  // Fetch cart items
  const fetchCartItems = useCallback(async () => {
    try {
      const cartCollectionRef = collection(doc(db, "users", userId), "cart");
      const querySnapshot = await getDocs(cartCollectionRef);
      const cartList = [];
      querySnapshot.forEach((doc) => {
        cartList.push({ id: doc.id, ...doc.data() });
      });
      setCartItems(cartList);
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
        favouritesList.push(doc.data().item_id); // Store only the item IDs
      });
      setFavouritesItems(favouritesList);
    } catch (error) {
      console.error("Error fetching favourite items:", error);
    }
  }, [userId]);

  const addToFavourite = useCallback(
    async (userId, itemId) => {
      try {
        const userDocRef = doc(db, "users", userId);
        const favouritesCollectionRef = collection(userDocRef, "favourites");

        const q = query(
          favouritesCollectionRef,
          where("item_id", "==", itemId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (docSnapshot) => {
            const existingDocRef = docSnapshot.ref;
            await deleteDoc(existingDocRef);
            toast(`Item deleted from favourites.`);
          });
        } else {
          const orderData = {
            item_id: itemId,
          };
          await addDoc(favouritesCollectionRef, orderData);
          toast(`Item added to favourites.`);
        }
        fetchFavouritesItems(); // Update favourites after change
      } catch (error) {
        console.error("Error adding or removing favourite:", error);
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

  const addToCart = async (userId, itemId) => {
    const orderData = {
      item_id: itemId,
      quantity: 1, // Default quantity
    };

    try {
      const userDocRef = doc(db, "users", userId);
      const cartCollectionRef = collection(userDocRef, "cart");
      const q = query(cartCollectionRef, where("item_id", "==", itemId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const existingDocRef = docSnapshot.ref;
        const currentData = docSnapshot.data();
        const newQuantity = (currentData.quantity || 0) + 1;

        await updateDoc(existingDocRef, { quantity: newQuantity });
      } else {
        await addDoc(cartCollectionRef, orderData);
        toast(`Added new item to cart.`);
      }
      fetchCartItems(); // Update cart items
    } catch (error) {
      console.error("Error adding or updating item:", error);
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

  // Return early if no user is logged in

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
          (cartItem) => cartItem.item_id === item.id
        );
        const isItemInFavourites = favouritesItems.includes(item.id);
        const cartItem = cartItems.find(
          (cartItem) => cartItem.item_id === item.id
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
                  ₹{parseFloat(item.price).toFixed(2)}
                </span>
                <span className="quantity">{item.grams} kg</span>
              </div>
              <div className="item-buttons">
                <button
                  className="favourite"
                  onClick={() => addToFavourite(userId, item.id)}
                >
                  <i
                    className={
                      isItemInFavourites ? "bx bxs-heart" : "bx bx-heart"
                    }
                  ></i>
                </button>

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
