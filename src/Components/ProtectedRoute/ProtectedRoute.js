import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, allowedRoles = ["admin"] }) {
  const { token, role, user } = useAuth();
  const effectiveRole = role || user?.role;
  const isAuthorized = Boolean(token) && allowedRoles.includes(effectiveRole);

  if (!isAuthorized) {
    const loginPath = allowedRoles.includes("admin") ? "/admin-login" : "/login";
    return <Navigate to={loginPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
