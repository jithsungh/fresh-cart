import { doc, collection, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import {toast} from 'react-toastify';

export const decrementCartItem = async (userId, itemId, setItems) => {
    try {
      // Reference the parent document (user)
      const userDocRef = doc(db, "users", userId);

      // Reference the cart subcollection
      const cartCollectionRef = collection(userDocRef, "cart");

      // Query to find the item in the cart
      const q = query(cartCollectionRef, where("item_id", "==", itemId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If the item exists, decrement its quantity
        querySnapshot.forEach(async (docSnapshot) => {
          const existingDocRef = docSnapshot.ref;
          const currentData = docSnapshot.data();
          if (currentData.quantity <= 1) {
            // If the quantity is already 1, delete the item
            await deleteDoc(existingDocRef);
            toast(`Deleted item from the cart.`);

            // Update the state by removing the deleted item
            setItems((prevItems) =>
              prevItems.filter((item) => item.item_id !== itemId)
            );
          } else {
            const newQuantity = currentData.quantity - 1; // Decrement quantity

            await updateDoc(existingDocRef, { quantity: newQuantity });

            console.log(`Decremented quantity of item ${itemId}.`);

            // Update the state by removing the deleted item
            setItems(
              (prevItems) =>
                prevItems
                  .map((item) =>
                    item.item_id === itemId
                      ? { ...item, quantity: newQuantity > 0 ? newQuantity : 0 }
                      : item
                  )
                  .filter((item) => item.quantity > 0) // Remove items with quantity 0
            );
          }
        });
      } else {
        console.log(`Item ${itemId} not found in the cart.`);
      }
    } catch (error) {
      console.error("Error decrementing cart item:", error);
    }
  };
