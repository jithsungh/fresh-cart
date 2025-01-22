import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/profile.css";
import { useUser } from "./UserContext";
import { Button } from "@mui/material";

const Profile = () => {
  const { uid } = useUser();
  const { logout } = useUser();
  const [userData, setUserData] = useState({});

  const fetchUserDetails = async () => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.log("Error getting document:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [uid]);

  const handleLogout = () => {
    logout();
    console.log("User logged out");
  }
  return (
    <div className="profile-container">
      <h1 >Profile</h1>
      <i class="bx bx-user-circle"></i>
      <p>Name: {userData.name}</p>
      <p>Email: {userData.email}</p>
      <p>Phone: {userData.mobile}</p>
      <div className="buttons">
        <Button variant="contained">Edit</Button>
        <Button variant="contained" onClick={handleLogout}>Logout</Button>
        <Button variant="contained">delete Account</Button>
      </div>
    </div>
  );
};

export default Profile;
