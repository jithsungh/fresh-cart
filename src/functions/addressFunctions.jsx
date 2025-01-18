import { doc, getDoc, setDoc, deleteDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust the path to your Firebase configuration
import { toast } from "react-toastify";
 
// DELETE AN ADDRESS
export const deleteAddress = async (userId, addressId) => {
    try {
      const addressDocRef = doc(db, "addresses", addressId); // Root collection
      const deletedAddressDocRef = doc(db, "deleted_addresses", addressId);
      const userDocRef = doc(db, `users`, userId);
  
      // Fetch the address document
      const addressDoc = await getDoc(addressDocRef);
      if (!addressDoc.exists()) {
        throw new Error("Address not found!");
      }
  
      // Fetch the user document
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User not found!");
      }
  
      const userData = userDoc.data();
      const addressesArray = userData.addresses || [];
      const defAddr = userData.def_addr || "";
  
      // Copy the document to the `deleted_addresses` collection
      const addressData = addressDoc.data();
      await setDoc(deletedAddressDocRef, {
        ...addressData,
        deleted_at: new Date().toISOString(), // Add a timestamp for when it was deleted
      });
  
      // Delete the document from the `addresses` collection
      await deleteDoc(addressDocRef);
  
      // Remove the addressId from the addresses array
      const updatedAddresses = addressesArray.filter((id) => id !== addressId);
  
      // Update the user document
      await updateDoc(userDocRef, {
        addresses: updatedAddresses,
        def_addr: defAddr === addressId ? "" : defAddr, // Set def_addr to "" if it matches the deleted addressId
      });
  
      console.log(`Address ${addressId} deleted, copied to deleted_addresses, and updated user document.`);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };
// EDIT EXISTING ADDRESS
export const editAddress = async (userId, addrId, addressData) => {
    try {
      const addressDocRef = doc(db, "addresses", addrId);
  
      // Fetch the current address document
      const addressDoc = await getDoc(addressDocRef);
      if (!addressDoc.exists()) {
        throw new Error("Address not found!");
      }
  
      // Update the address document with the new data
      await updateDoc(addressDocRef, addressData);
  
      console.log(`Address ${addrId} updated successfully.`);
    } catch (error) {
      console.error("Error editing address:", error);
    }
};

// ADD NEW ADDRESS
export const addNewAddress = async (userId, addressData, setAsDefault) => {
    try {
      // Create a reference to the 'addresses' collection
      const addressesCollectionRef = collection(db, "addresses");
  
      // Add the new address to the 'addresses' collection
      const newAddressDocRef = await addDoc(addressesCollectionRef, addressData);
  
      // Reference to the user's document
      const userDocRef = doc(db, "users", userId);
  
      // Update the user's document
      await updateDoc(userDocRef, {
        // Add the new address reference to the user's 'addresses' array
        addresses: arrayUnion(newAddressDocRef.id),
        // If setAsDefault is true, update def_addr to the new addressId
        def_addr: setAsDefault ? newAddressDocRef.id : null,
      });
  
      toast.success(`New address added successfully!`);
    } catch (error) {
      console.error("Error adding new address:", error);
    }
  };

