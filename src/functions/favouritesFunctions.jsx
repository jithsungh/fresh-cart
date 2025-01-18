import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";
// Toggle FAVOURITES
export const toggleFavourite = async (userId, itemId) => {
  try {
    const userDocRef = doc(db, "users", userId);

    // Fetch the current user's favourites
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error("User not found!");
    }

    const userData = userDoc.data();
    const favourites = userData.favourites || [];

    if (favourites.includes(itemId)) {
      // Item is already in favourites, remove it
      await updateDoc(userDocRef, {
        favourites: arrayRemove(itemId),
      });
      console.log(`Item ${itemId} removed from favourites.`);
    } else {
      // Item is not in favourites, add it
      await updateDoc(userDocRef, {
        favourites: arrayUnion(itemId),
      });
      console.log(`Item ${itemId} added to favourites.`);
    }
  } catch (error) {
    console.error("Error toggling favourite:", error);
  }
};

// Fetch the user's favourites
export const fetchFavourites = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.favourites || [];
    } else {
      console.error("User document not found.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching favourites:", error);
    return [];
  }
};
