import { doc, collection, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the path to your Firebase configuration
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
      list_name: listName,
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

    // Fetch the current document
    const listDoc = await getDoc(listDocRef);
    if (!listDoc.exists()) {
      throw new Error("List not found!");
    }

    const data = listDoc.data();
    const items = data.items || [];

    // Find the item and increment its quantity
    const updatedItems = items.map((item) =>
      item.item_id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );

    // Update the document with the modified array
    await updateDoc(listDocRef, { items: updatedItems });

    console.log(`Incremented quantity for item ${itemId} in list ${listId}.`);
  } catch (error) {
    console.error("Error incrementing item quantity:", error);
  }
};


// DECREMENT QUANTITY
export const decrementItem = async (userId, listId, itemId) => {
  try {
    const listDocRef = doc(db, `users/${userId}/lists`, listId);

    // Fetch the current document
    const listDoc = await getDoc(listDocRef);
    if (!listDoc.exists()) {
      throw new Error("List not found!");
    }

    const data = listDoc.data();
    const items = data.items || [];

    // Update the array: decrement quantity or remove the item if quantity is 0
    const updatedItems = items
      .map((item) =>
        item.item_id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0); // Remove items with quantity 0

    // Update the document with the modified array
    await updateDoc(listDocRef, { items: updatedItems });

    console.log(`Decremented quantity for item ${itemId} in list ${listId}.`);
  } catch (error) {
    console.error("Error decrementing item quantity:", error);
  }
};


// ADD ITEM TO AN EXISTING LIST
export const addItemToList = async (userId, listId, itemId, quantity) => {
  try {
    // Reference to the specific document in the lists sub-collection
    const listDocRef = doc(db, `users/${userId}/lists`, listId);

    // Add the item to the array field
    await updateDoc(listDocRef, {
      items: arrayUnion({ item_id: itemId, quantity: quantity }),
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

    // Fetch the current document
    const listDoc = await getDoc(listDocRef);
    if (!listDoc.exists()) {
      throw new Error("List not found!");
    }

    const data = listDoc.data();
    const items = data.items || [];

    // Filter out the item with the specified item_id
    const updatedItems = items.filter((item) => item.item_id !== itemId);

    // Update the document with the modified array
    await updateDoc(listDocRef, { items: updatedItems });

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

