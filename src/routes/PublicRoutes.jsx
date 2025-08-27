import { Navigate } from "react-router-dom";

export default function PublicRoutes({ children }) {
  const rolesStr = localStorage.getItem("roles");
  const roles = rolesStr ? rolesStr.split(",") : [];
  const lastPath = localStorage.getItem("lastPath") || "/region";

  if (roles.length) {
    // Agar foydalanuvchi admin bo'lsa → Layout + oxirgi sahifa
    return <Navigate to={lastPath} replace />;
  }

  return children;
}
