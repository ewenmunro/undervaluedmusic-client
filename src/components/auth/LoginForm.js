import React, { useState } from "react";
import axios from "axios";

// assets/styles
import "../../assets/styles/loginform.css";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function LoginForm({ onLogin }) {
  // State to store user input
  const [formData, setFormData] = useState({ username: "", password: "" });
  // State to store validation errors
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract username and password from formData
    const { username, password } = formData;

    // Validation logic
    const validationErrors = {};

    if (!username.trim()) {
      validationErrors.username = "Username is required";
    }

    if (!password.trim()) {
      validationErrors.password = "Password is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});

      try {
        // Make an Axios POST request to your backend API for user authentication
        const response = await axios.post(`${apiBaseUrl}/api/users/login`, {
          username,
          password,
        });

        if (response.status === 200) {
          // Retrieve user data using the token
          const userDataResponse = await axios.get(
            `${apiBaseUrl}/api/users/profile/${username}`
          );

          if (userDataResponse.status === 200) {
            const userData = userDataResponse.data.user;

            if (userData.verified === true) {
              // User is verified, proceed with login
              const accessToken = response.data.accessToken;
              const accessTokenExpiration = response.data.accessTokenExpiration;
              localStorage.setItem(
                "accessTokenExpiration",
                accessTokenExpiration
              );

              // Make a request to store or update the refresh token
              const storeRefreshToken = async () => {
                const refreshToken = response.data.refreshToken;

                // Store the refresh token as an HTTP-only secure cookie
                document.cookie = `refreshToken=${refreshToken}; path=/; secure; HttpOnly`;

                // Store refreshToken in local storage or cookies
                localStorage.setItem("refreshToken", refreshToken);

                try {
                  const refreshTokenResponse = await axios.post(
                    `${apiBaseUrl}/api/auth/store`,
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    }
                  );

                  if (refreshTokenResponse.status === 200) {
                    // Refresh token stored successfully
                    return true;
                  }
                } catch (error) {
                  console.error("Refresh token storage failed:", error);
                }
              };

              // Call storeRefreshToken to store the refresh token
              storeRefreshToken();

              // Successful login
              setFormData({ username: "", password: "" });

              // Call the onLogin function from props with the token and user data
              onLogin(accessToken, userData, null);
            } else {
              // User is unverified, display an error message
              setLoginError(
                "Login failed. Your account is not yet verified. Please check your email for verification instructions."
              );
            }
          } else {
            // Handle other response statuses, if needed
            setLoginError("Login failed. Please try again.");
          }
        } else {
          setErrors("");
          // Handle other response statuses, if needed
          setLoginError("Login failed. Please try again.");
        }
      } catch (error) {
        setErrors("");
        // Handle any errors that occur during the request
        console.error("Login failed:", error);
        setLoginError("Login failed. Please try again.");
      }
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update the formData state with the new input value
    setFormData({ ...formData, [name]: value });
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" />
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="input-field"
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        <div>
          <label htmlFor="password" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="input-field"
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <div>
          <input
            type="checkbox"
            id="showPassword"
            name="showPassword"
            checked={showPassword}
            onChange={togglePasswordVisibility}
          />
          <label htmlFor="showPassword">Show Password</label>
        </div>
        <div>
          <button type="submit" className="login-button">
            Login
          </button>
        </div>
        {loginError && <div className="login-error-message">{loginError}</div>}
      </form>
    </div>
  );
}

export default LoginForm;
