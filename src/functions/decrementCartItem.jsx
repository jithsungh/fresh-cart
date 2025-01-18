import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { toast } from "react-toastify";


export const decrementCartItem = async (userId, itemId, setItems) => {
  try {
    // Reference the specific cart item document
    const cartDocRef = doc(db, `users/${userId}/cart`, itemId);

    // Fetch the current data of the item
    const docSnapshot = await getDoc(cartDocRef);

    if (docSnapshot.exists()) {
      const currentData = docSnapshot.data();

      if (currentData.quantity <= 1) {
        // If the quantity is 1 or less, delete the item from the cart
        await deleteDoc(cartDocRef);
        toast(`Item removed from the cart.`);

        // Update the state by removing the item
        setItems((prevItems) =>
          prevItems.filter((item) => item.itemId !== itemId)
        );
      } else {
        // Decrement the quantity
        const newQuantity = currentData.quantity - 1;

        // Update the quantity in Firestore
        await updateDoc(cartDocRef, { quantity: newQuantity });
        console.log(`Decreased quantity of item ${itemId}.`);

        // Update the state
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.itemId === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } else {
      console.log(`Item ${itemId} not found in the cart.`);
    }
  } catch (error) {
    console.error("Error decrementing cart item:", error);
    toast.error("Failed to decrement cart item.");
  }
};


