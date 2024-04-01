import React, { useState } from "react";
import "../assets/styles/userprofile.css";

// components/user
import UserSettings from "../components/user/UserSettings";

function UserProfile() {
  // Define the user object and a function to handle user updates
  const [user, setUser] = useState({
    username: "",
    email: "",
  });

  const handleUpdateUser = (updatedUserData) => {
    // Implement logic to update the user data in the state
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
    }));
  };

  return (
    <div className="userprofile">
      <h1>My Profile</h1>
      <UserSettings user={user} onUpdateUser={handleUpdateUser} />
    </div>
  );
}

export default UserProfile;
