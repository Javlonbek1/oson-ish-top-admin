import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoutes({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  const rolesStr = localStorage.getItem("roles"); // "ROLE_USER,ROLE_ADMIN"
  const location = useLocation();

  const roles = rolesStr ? rolesStr.split(",") : [];
  const isAllowed = allowedRoles.length
    ? allowedRoles.some((role) => roles.includes(role))
    : roles.length > 0; // agar allowedRoles berilmagan bo'lsa, token/roles bo'lsa ruxsat

  if (!token || !isAllowed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
