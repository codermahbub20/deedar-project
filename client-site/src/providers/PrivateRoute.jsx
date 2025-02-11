// PrivateRoute.js
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthProviders";
// import { AuthContext } from "./path/to/AuthProvider"; // Adjust path as needed

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner or message
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
