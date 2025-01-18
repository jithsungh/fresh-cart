import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { toast } from "react-toastify";

/**
 * Add a new item to the cart or update its quantity if it already exists.
 */
export const addToCart = async (userId, itemId) => {
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
      toast.success(`Added new item ${itemId} to cart.`);
    }
    fetchCartItems(); // Update cart items after adding/updating
  } catch (error) {
    console.error("Error adding or updating item:", error);
    toast.error("Failed to add or update item in cart.");
  }
};

/**
 * Increment the quantity of an item in the cart.
 */
export const incrementCartItem = async (userId, itemId) => {
  try {
    const userDocRef = doc(db, "users", userId);

    // Fetch the current user document
    const userDoc = await getDoc(userDocRef);
    const userCart = userDoc.data()?.cart || {};

    if (!userCart[itemId]) {
      throw new Error("Item not found in the cart.");
    }

    // Increment the quantity
    userCart[itemId].quantity += 1;

    // Update the cart in Firestore
    await updateDoc(userDocRef, { cart: userCart });

    toast.success(`Incremented quantity for item ${itemId}.`);
  } catch (error) {
    console.error("Error incrementing item quantity:", error);
    toast.error("Failed to increment item quantity.");
  }
};

/**
 * Decrement the quantity of an item in the cart. If quantity reaches 0, remove the item.
 */
export const decrementCartItem = async (userId, itemId) => {
  try {
    const userDocRef = doc(db, "users", userId);

    // Fetch the current user document
    const userDoc = await getDoc(userDocRef);
    const userCart = userDoc.data()?.cart || {};

    if (!userCart[itemId]) {
      throw new Error("Item not found in the cart.");
    }

    // Decrement the quantity
    const newQuantity = userCart[itemId].quantity - 1;

    if (newQuantity <= 0) {
      // Remove the item if the quantity is 0
      delete userCart[itemId];
      toast.info(`Removed item ${itemId} from the cart.`);
    } else {
      userCart[itemId].quantity = newQuantity;
      toast.success(`Decremented quantity for item ${itemId}.`);
    }

    // Update the cart in Firestore
    await updateDoc(userDocRef, { cart: userCart });
  } catch (error) {
    console.error("Error decrementing item quantity:", error);
    toast.error("Failed to decrement item quantity.");
  }
};

/**
 * Delete an item from the cart.
 */
export const deleteCartItem = async (userId, itemId) => {
  try {
    const userDocRef = doc(db, "users", userId);

    // Fetch the current user document
    const userDoc = await getDoc(userDocRef);
    const userCart = userDoc.data()?.cart || {};

    if (!userCart[itemId]) {
      throw new Error("Item not found in the cart.");
    }

    // Remove the item from the cart
    delete userCart[itemId];

    // Update the cart in Firestore
    await updateDoc(userDocRef, { cart: userCart });

    toast.info(`Deleted item ${itemId} from the cart.`);
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    toast.error("Failed to delete item from cart.");
  }
};

/**
 * Update the quantity of a specific item in the cart.
 */
export const updateCartItem = async (userId, itemId, newQuantity) => {
  try {
    const userDocRef = doc(db, "users", userId);

    // Fetch the current user document
    const userDoc = await getDoc(userDocRef);
    const userCart = userDoc.data()?.cart || {};

    if (!userCart[itemId]) {
      throw new Error("Item not found in the cart.");
    }

    if (newQuantity <= 0) {
      // Remove the item if the new quantity is 0
      delete userCart[itemId];
      toast.info(`Removed item ${itemId} from the cart.`);
    } else {
      // Update the quantity
      userCart[itemId].quantity = newQuantity;
      toast.success(`Updated quantity for item ${itemId} to ${newQuantity}.`);
    }

    // Update the cart in Firestore
    await updateDoc(userDocRef, { cart: userCart });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    toast.error("Failed to update item quantity.");
  }
};
