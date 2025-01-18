import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Adjust the path to your Firebase configuration

export const editUserDetails = async (userId, name, email) => {
  try {
    // Reference to the user's document
    const userDocRef = doc(db, "users", userId);

    // Update the user's name and email
    await updateDoc(userDocRef, {
      name: name,
      email: email,
    });

    console.log(`User details updated successfully for user ${userId}.`);
  } catch (error) {
    console.error("Error updating user details:", error);
  }
};

export const updatePhoneNumber = async (userId, newPhoneNumber, verificationId, verificationCode) => {
    try {
      /*const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        throw new Error("User is not authenticated!");
      }
  
      // Create a PhoneAuthCredential with the verification ID and verification code
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
  
      // Re-authenticate the user with the new phone number
      await reauthenticateWithCredential(user, credential);
  
      // Reference to the user's document in Firestore
      const userDocRef = doc(db, "users", userId);
  
      // Update the phone number in Firestore
      await updateDoc(userDocRef, {
        phone_number: newPhoneNumber,
      });
  
      console.log(`Phone number updated successfully for user ${userId}.`);*/
    } catch (error) {
      console.error("Error updating phone number:", error);
    }
  };

// DELETE USER ACCOUNT
export const deleteUser = async (userId) => {
    try {
      // Reference to the user's document in the 'users' collection
      const userDocRef = doc(db, "users", userId);
      
      // Fetch the user's document
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User not found!");
      }
  
      // Copy the user's document to the 'deleted_users' collection
      const deletedUserDocRef = doc(db, "deleted_users", userId);
      await setDoc(deletedUserDocRef, {
        ...userDoc.data(),
        deleted_at: new Date().toISOString(), // Add a timestamp for when it was deleted
      });
  
      // Delete the user's document from the 'users' collection
      await deleteDoc(userDocRef);
  
      console.log(`User ${userId} deleted and copied to deleted_users.`);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
