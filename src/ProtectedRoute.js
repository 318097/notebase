import React from "react";
import { Redirect } from "react-router-dom";

const ProtectedRoute = ({ children, hasAccess }) => {
  return hasAccess ? children : <Redirect to="/login" />;
};

export default ProtectedRoute;
