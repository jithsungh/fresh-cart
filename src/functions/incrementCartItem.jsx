import { doc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config"; // Adjust the path as needed

export const incrementCartItem = async (userId, itemId, setItems) => {
  try {
    // Reference the parent document (user)
    const userDocRef = doc(db, "users", userId);

    // Reference the cart subcollection
    const cartCollectionRef = collection(userDocRef, "cart");

    // Query to find the item in the cart
    const q = query(cartCollectionRef, where("item_id", "==", itemId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If the item exists, increment its quantity
      querySnapshot.forEach(async (docSnapshot) => {
        const existingDocRef = docSnapshot.ref;
        const currentData = docSnapshot.data();
        const newQuantity = currentData.quantity + 1; // Increment quantity

        await updateDoc(existingDocRef, { quantity: newQuantity });

        console.log(`Incremented quantity of item ${itemId}.`);

        // Update the state
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.item_id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      });
    } else {
      console.log(`Item ${itemId} not found in the cart.`);
    }
  } catch (error) {
    console.error("Error incrementing cart item:", error);
  }
};
