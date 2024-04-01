import { Navigate, Outlet } from "react-router-dom";

// components/auth
import { useAuth } from "../auth/AuthContext";

const PrivateRoutes = () => {
  // Use the useAuth hook to access the authentication state
  const { isAuthenticated } = useAuth();

  // Check if the user is authenticated and if user data exists
  if (isAuthenticated) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoutes;
