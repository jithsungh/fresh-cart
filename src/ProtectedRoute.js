import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext";

function ProtectedRoute({ children }) {
  const { uid, loading } = useUser();

  // If the app is still loading the user state, don't render anything yet
  if (loading) {
    return null; // Or you can show a loading spinner
  }

  // If no uid, redirect to login
  if (!uid) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
