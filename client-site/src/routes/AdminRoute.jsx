/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import useRole from "../Hooks/useRole";

const AdminRoute = ({ children }) => {
  const [role, isLoading] = useRole();
  console.log(role);
  if (isLoading) return <p>..</p>;

  if (role === "Admin") return children;

  return <Navigate to="/dashboard" replace></Navigate>;
};

export default AdminRoute;
