import React from "react";
import { Redirect } from "react-router-dom";

const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Redirect to="/login" />;
};

export default ProtectedRoute;
