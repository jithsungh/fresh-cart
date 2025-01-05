import React, { createContext, useContext, useState, useEffect } from "react";

// Create the UserContext
const UserContext = createContext();

// Create the UserProvider component
export function UserProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    // Check if the uid is stored in localStorage
    const storedUid = localStorage.getItem("uid");
    if (storedUid) {
      setUid(storedUid);
    }
    setLoading(false); // Set loading to false once the check is complete
  }, []);

  const login = (uid) => {
    // Store the uid in localStorage
    localStorage.setItem("uid", uid);
    setUid(uid);
  };

  const logout = () => {
    // Remove the uid from localStorage
    localStorage.removeItem("uid");
    setUid(null);
  };

  return (
    <UserContext.Provider value={{ uid, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export function useUser() {
  return useContext(UserContext);
}
