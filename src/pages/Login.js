import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/login.css";

// components/auth
import { useAuth } from "../components/auth/AuthContext";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (token, userData, newAccessToken) => {
    // Update the user data and newToken in the app's state
    dispatch({ type: "LOGIN", token, user: userData, newAccessToken });

    // Navigate to the dashboard or any other route you want
    navigate("/dashboard");
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <LoginForm
        onLogin={(token, userData) => handleLogin(token, userData, null)}
      />
    </div>
  );
}

export default Login;
