import React, { useEffect } from "react";

// components/auth
import { useAuth } from "../components/auth/AuthContext";

// assets/styles
import "../assets/styles/accountdeleted.css";

function AccountDeleted() {
  const { dispatch } = useAuth();

  useEffect(() => {
    // Dispatch the logout action
    dispatch({ type: "LOGOUT" });
  }, [dispatch]);

  return (
    <div className="account-deleted">
      <h1>Your Account Has Been Deleted</h1>
      <p>We're sorry to see you go!</p>
      <p>If you change your mind, feel free to create a new account anytime.</p>
    </div>
  );
}

export default AccountDeleted;
