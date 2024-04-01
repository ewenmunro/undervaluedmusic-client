import React, { useState } from "react";
import axios from "axios";

import "../../assets/styles/usersettings.css";

// components/auth
import { useAuth } from "../auth/AuthContext";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function UserSettings({ user, onUpdateUser }) {
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [updateErrorMessage, setUpdateErrorMessage] = useState("");
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "username" && value.includes(" ")) {
      setUsernameError("Username cannot contain spaces");
    } else {
      setUsernameError("");
    }
    if (name === "email" && value.includes(" ")) {
      setEmailError("Email cannot contain spaces");
    } else {
      setEmailError("");
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const checkUsernameEmailExistence = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/api/users/check`, {
        username: formData.username,
        email: formData.email,
      });

      if (response.data.usernameExists) {
        setUsernameError("Username is already taken");
        return false;
      }

      if (response.data.emailExists) {
        setEmailError("Email is already taken");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Username/Email check failed:", error);
      return false;
    }
  };

  const updateUserData = async (url, data, successMessage) => {
    try {
      const token = isAuthenticated.token;

      console.log(token);

      const response = await axios.put(`${apiBaseUrl}/${url}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Clear the form fields and error messages after a successful update
        setFormData((prevData) => ({ ...prevData, ...data }));
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setUpdateErrorMessage("");
        setUpdateSuccessMessage(successMessage);

        // Call the onUpdateUser function to update the user data in your app
        onUpdateUser({ ...formData, ...data });
      } else {
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setUpdateSuccessMessage("");
        setUpdateErrorMessage(`Update failed. Please try again.`);
      }
    } catch (error) {
      setUsernameError("");
      setEmailError("");
      setPasswordError("");
      setUpdateSuccessMessage("");
      setUpdateErrorMessage(`Update failed. Please try again.`);
      console.error(`Update failed:`, error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usernameEmailExist = await checkUsernameEmailExistence();

    if (!usernameEmailExist) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("This is not a valid email address");
      return;
    }

    updateUserData(
      `api/users/profile/${isAuthenticated.user.user_id}`,
      formData,
      "Profile updated successfully"
    );
  };

  const handleUsernameUpdate = async () => {
    const usernameEmailExist = await checkUsernameEmailExistence();

    if (!usernameEmailExist) {
      return;
    }

    updateUserData(
      `api/users/profile/${isAuthenticated.user.user_id}`,
      { username: formData.username },
      "Username updated successfully. You'll see the changes on your profile when you log back in again."
    );
  };

  const handleEmailUpdate = async () => {
    const usernameEmailExist = await checkUsernameEmailExistence();

    if (!usernameEmailExist) {
      return;
    }

    updateUserData(
      `api/users/profile/${isAuthenticated.user.user_id}`,
      { email: formData.email },
      "Email updated successfully. You'll see the changes on your profile when you log back in again."
    );
  };

  const handlePasswordUpdate = async () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    updateUserData(
      `api/users/profile/${isAuthenticated.user.user_id}`,
      { password: formData.password },
      "Password updated successfully"
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="user-settings-container">
      <div className="current-info">
        <h2>Current Information</h2>
        <p>
          <b>Username:</b> {isAuthenticated.user.username}
        </p>
        <p>
          <b>Email:</b> {isAuthenticated.user.email}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="update-form">
        <h2>Update Information</h2>
        <div className="input-container">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="New Username"
            value={formData.username}
            onChange={handleInputChange}
            className="input-field"
          />
          {usernameError && (
            <div className="error-message">{usernameError}</div>
          )}
          <button
            type="button"
            className="update-button"
            onClick={handleUsernameUpdate}
          >
            Update Username
          </button>
        </div>
        <div className="input-container">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="New Email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
          />
          {emailError && <div className="error-message">{emailError}</div>}
          <button
            type="button"
            className="update-button"
            onClick={handleEmailUpdate}
          >
            Update Email
          </button>
        </div>
        <div className="input-container">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="New Password"
            value={formData.password}
            onChange={handleInputChange}
            className="input-field"
          />
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="input-field"
          />
          {passwordError && (
            <div className="password-error-message">{passwordError}</div>
          )}
          <button
            type="button"
            className="update-button"
            onClick={handlePasswordUpdate}
          >
            Update Password
          </button>
        </div>
        <div>
          <input
            type="checkbox"
            id="showPassword"
            name="showPassword"
            checked={showPassword}
            onChange={togglePasswordVisibility}
          />
          <label htmlFor="showPassword">Show Passwords</label>
        </div>
        <div>
          {updateErrorMessage && (
            <div className="update-error-message">{updateErrorMessage}</div>
          )}
          {updateSuccessMessage && (
            <div className="update-success-message">{updateSuccessMessage}</div>
          )}
        </div>
      </form>
    </div>
  );
}

export default UserSettings;
