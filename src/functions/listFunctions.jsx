import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  deleteField,
} from "firebase/firestore";
import { db } from "../firebase-config"; // Adjust the path to your Firebase configuration
import { toast } from "react-toastify";

// CREATE A NEW LIST
export const createNewList = async (userId, listName) => {
  try {
    // Reference to the lists sub-collection for the user
    const listsCollectionRef = collection(db, `users/${userId}/lists`);

    // Generate a new document with an auto-generated ID
    const newListDocRef = doc(listsCollectionRef);

    // Set the initial data for the new list
    await setDoc(newListDocRef, {
      name: listName,
      items: [], // Initialize with an empty array
    });

    toast(`New list '${listName}' created successfully!`);
    return newListDocRef.id; // Return the new list's ID
  } catch (error) {
    console.error("Error creating new list:", error);
    throw error; // Re-throw the error for further handling if needed
  }
};

// INCREMENT QUANTITY
export const incrementItem = async (userId, listId, itemId) => {
  try {
    const listDocRef = doc(db, `users/${userId}/lists`, listId);

    // Increment the quantity of the item
    await updateDoc(listDocRef, {
      [`items.${itemId}.quantity`]: increment(1), // Firestore's increment function
    });

    console.log(`Incremented quantity for item ${itemId} in list ${listId}.`);
  } catch (error) {
    console.error("Error incrementing item quantity:", error);
  }
};

// DECREMENT QUANTITY

export const decrementItem = async (userId, listId, itemId) => {
  try {
    const listDocRef = doc(db, `users/${userId}/lists`, listId);
    const listSnapshot = await getDoc(listDocRef);

    if (!listSnapshot.exists()) {
      console.error(`List ${listId} does not exist for user ${userId}.`);
      return;
    }

    const listData = listSnapshot.data();
    const currentQuantity = listData.items?.[itemId]?.quantity || 0;

    if (currentQuantity > 1) {
      // Decrement the quantity
      await updateDoc(listDocRef, {
        [`items.${itemId}.quantity`]: increment(-1),
      });
      console.log(`Decremented quantity for item ${itemId} in list ${listId}.`);
    } else if (currentQuantity === 1) {
      // Remove the item when quantity reaches 0
      await updateDoc(listDocRef, {
        [`items.${itemId}`]: deleteField(),
      });
      console.log(`Item ${itemId} removed from list ${listId}.`);
    } else {
      console.warn(`Item ${itemId} already has quantity 0.`);
    }
  } catch (error) {
    console.error("Error decrementing item quantity:", error);
  }
};
// ADD ITEM TO AN EXISTING LIST
export const addItemToList = async (userId, listId, itemId, quantity) => {
  try {
    const listDocRef = doc(db, `users/${userId}/lists`, listId);

    // Add or update the item in the map
    await updateDoc(listDocRef, {
      [`items.${itemId}`]: { quantity: quantity },
    });

    console.log(
      `Item ${itemId} with quantity ${quantity} added to list ${listId} for user ${userId}.`
    );
  } catch (error) {
    console.error("Error adding item to list:", error);
  }
};

// Delete an item from a list
export const deleteItemFromList = async (userId, listId, itemId) => {
  try {
    const listDocRef = doc(db, `users/${userId}/lists`, listId);

    // Remove the item from the map
    await updateDoc(listDocRef, {
      [`items.${itemId}`]: deleteField(),
    });

    console.log(`Deleted item ${itemId} from list ${listId}.`);
  } catch (error) {
    console.error("Error deleting item from list:", error);
  }
};

// DELETE A LIST
export const deleteList = async (userId, listId) => {
  try {
    const listDocRef = doc(db, `users/${userId}/lists`, listId);
    await deleteDoc(listDocRef);
    console.log(`List ${listId} deleted successfully!`);
  } catch (error) {
    console.error("Error deleting list:", error);
  }
};

// CREATE A NEW LIST WITH ITEMS
export const createNewListWithItems = async (userId, listName, itemData) => {
  try {
    // Reference to the lists sub-collection for the user
    const listsCollectionRef = collection(db, `users/${userId}/lists`);

    // Generate a new document with an auto-generated ID
    const newListDocRef = doc(listsCollectionRef);

    // Set the initial data for the new list with items
    await setDoc(newListDocRef, {
      name: listName,
      items: itemData, // Initialize with provided items
    });

    toast.success(`New list ${listName} created successfully.`);
    return newListDocRef.id; // Return the new list's ID
  } catch (error) {
    console.error("Error creating new list with items:", error);
    throw error; // Re-throw the error for further handling if needed
  }
};
