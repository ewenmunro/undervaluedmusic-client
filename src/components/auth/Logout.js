import React, { useEffect } from "react";
import "../../assets/styles/logout.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Logout = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      // Dispatch the logout action
      dispatch({ type: "LOGOUT" });

      // Simulate a delay (you can adjust the duration)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to the login page
      navigate("/");
    };

    performLogout();
  }, [dispatch, navigate]);

  return <div className="logout-message">Logging out...</div>;
};

export default Logout;
