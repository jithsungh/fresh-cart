import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config"; // Adjust the path as needed
import { toast } from "react-toastify";

export const incrementCartItem = async (userId, itemId, setItems) => {
  try {
    // Reference the specific cart item document
    const cartDocRef = doc(db, `users/${userId}/cart`, itemId);

    // Fetch the current data of the item
    const docSnapshot = await getDoc(cartDocRef);

    if (docSnapshot.exists()) {
      // Increment the quantity if the item exists
      const currentData = docSnapshot.data();
      const newQuantity = currentData.quantity + 1;

      // Update the quantity in Firestore
      await updateDoc(cartDocRef, { quantity: newQuantity });

      console.log(`Incremented quantity of item ${itemId}.`);

      // Update the state
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.itemId === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } else {
      console.log(`Item ${itemId} not found in the cart.`);
    }
  } catch (error) {
    console.error("Error incrementing cart item:", error);
  }
};
