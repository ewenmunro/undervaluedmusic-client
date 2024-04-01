import React, { useState } from "react";
import axios from "axios";

// assets/styles
import "../../assets/styles/signupform.css";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function RegistrationForm({ onRegister }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for error messages
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // State for registration message
  const [registrationError, setRegistrationError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Check for empty spaces in username and email
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

      // Check if username or email already exists
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if passwords match before submitting
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Check if username or email already exists
    const usernameEmailExist = await checkUsernameEmailExistence();

    if (!usernameEmailExist) {
      return;
    }

    // Check if the user has agreed to the Terms & Conditions and Privacy Policy
    if (!agreedToTerms) {
      setRegistrationError(
        "You need to agree to the Terms & Conditions and Privacy Policy to create your account"
      );
      return;
    }

    try {
      // Check for a valid email address format
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setEmailError("This is not a valid email address");
        return;
      }

      // Make an Axios POST request to your backend API for user registration
      const registrationResponse = await axios.post(
        `${apiBaseUrl}/api/users/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );

      // Handle the response from the server
      if (registrationResponse.status === 201) {
        // Clear the form fields and error messages after successful registration
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setRegistrationError("");
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        setAgreedToTerms(false);
        // Provide feedback to the parent component
        onRegister(true);
      } else {
        setRegistrationError("");
        setUsernameError("");
        setEmailError("");
        setPasswordError("");
        // Handle other response statuses, if needed
        setRegistrationError("Registration failed. Please try again.");
      }
    } catch (error) {
      setRegistrationError("");
      setUsernameError("");
      setEmailError("");
      setPasswordError("");
      // Handle any errors that occur during the request
      console.error("Registration failed:", error);
      setRegistrationError("Registration failed. Please try again.");
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTermsClick = () => {
    // Create a modal/pop-up for terms and conditions
    const modal = document.createElement("div");
    modal.className = "terms-modal";

    // Close button for the modal
    const closeButton = document.createElement("span");
    closeButton.className = "close-button";
    closeButton.textContent = "✖️";
    closeButton.addEventListener("click", () => {
      modal.remove(); // Close the modal when clicking the close button
    });

    // Terms and Conditions content
    const termsContent = document.createElement("div");
    termsContent.className = "terms-content";
    termsContent.innerHTML = `
    <div class="terms-content">
      <h1>Undervalued Music - Terms and Conditions</h1>
  
      <p>Welcome to Undervalued Music! These terms and conditions outline the rules and regulations for the use of our website, undervaluedmusic.com.</p>
  
      <h2>1. User Data</h2>
  
      <p>1.1. Undervalued Music may collect and store user information for the purpose of providing personalized and enhanced services.</p>
  
      <p>1.2. We are committed to ensuring that your privacy is protected. Please refer to our Privacy Policy for information on how we collect, use, and safeguard your data.</p>
  
      <h2>2. Acceptable Use</h2>
  
      <p>2.1. By using undervaluedmusic.com, you agree not to engage in any activity that may:</p>
  
      <ul>
        <li>a. Violate any applicable laws or regulations.</li>
        <li>b. Infringe upon the rights of others.</li>
        <li>c. Disrupt the normal functioning of the website.</li>
      </ul>
  
      <h2>3. Promotional Communications</h2>
  
      <p>3.1. By providing your contact information, you consent to receive promotional information related to Undervalued Music.</p>
  
      <p>3.2. You can opt-out of receiving promotional communications at any time by following the instructions provided in the communication.</p>

      <h2>4. Modifications</h2>

      <p>4.1. Undervalued Music reserves the right to revise these terms and conditions at any time without prior notice. By using this website, you agree to be bound by the current version of these terms and conditions.</p>

      <h2>5. Governing Law</h2>

      <p>5.1. These terms and conditions are governed by and construed in accordance with the laws of Australia.</p>

      <p>5.2. If you reside outside of Australia, you agree to comply with all local laws and regulations applicable to your use of Undervalued Music. However, the governing law for any legal disputes arising from the use of this website remains the laws of Australia.</p>

      <p>5.3. By using this website, you submit to the exclusive jurisdiction of the courts in Australia for the resolution of any disputes.</p>

      <h2>6. Contact Information</h2>

      <p>6.1. For any questions or concerns regarding these terms and conditions, please contact us at <a href="mailto:undervaluedmusic18@gmail.com">undervaluedmusic18@gmail.com.</a></p>    
    </div>
  `;

    // Append elements to the modal
    modal.appendChild(closeButton);
    modal.appendChild(termsContent);

    // Append the modal to the document body
    document.body.appendChild(modal);
  };

  const handlePrivacyPolicyClick = () => {
    // Create a modal/pop-up for the privacy policy
    const modal = document.createElement("div");
    modal.className = "terms-modal";

    // Close button for the modal
    const closeButton = document.createElement("span");
    closeButton.className = "close-button";
    closeButton.textContent = "✖️";
    closeButton.addEventListener("click", () => {
      modal.remove(); // Close the modal when clicking the close button
    });

    // Privacy Policy content
    const privacyPolicyContent = document.createElement("div");
    privacyPolicyContent.className = "terms-content";
    privacyPolicyContent.innerHTML = `
    <div class="terms-content">
      <h1>Undervalued Music - Privacy Policy</h1>

      <p>Last Updated: 1st January 2024</p>

      <p>This Privacy Policy describes how Undervalued Music ("we," "us," or "our") collects, uses, and discloses your personal information when you visit our website undervaluedmusic.com ("the Website"). By using the Website, you agree to the terms and conditions of this Privacy Policy.</p>
  
      <h2>1. Information We Collect</h2>

      <h3>1.1. Personal Information</h3>

      <p>We may collect personal information that you provide directly to us, including but not limited to your name, email address, and any other information you choose to provide.</p>

      <h3>1.2. Usage Information</h3>

      <p>We may collect information about how you access and use the Website, including your IP address, browser type, and device information.</p>

      <h2>2. How We Use Your Information</h2>

      <h3>2.1. Provide and Maintain the Website</h3>

      <p>We use the information collected to operate, maintain, and improve the Website's functionality.</p>

      <h3>2.2. Communication</h3>

      <p>We may use your contact information to send you updates, newsletters, and promotional materials. You can opt-out of these communications at any time.</p>

      <h3>2.3. Analytics</h3>

      <p>We may use third-party analytics tools to analyze user activity on the Website.</p>

      <h2>3. Information Sharing</h2>

      <p>We do not sell, trade, or otherwise transfer your personal information to third parties. However, we may share information with trusted service providers who assist us in operating the Website.</p>

      <h2>4. Cookies and Tracking Technologies</h2>

      <p>The Website may use cookies or other local storage where legally required, and may collect, share, and use personal data for the personalization of ads. You can set your browser to refuse all or some browser cookies, but this may affect your ability to access or use certain parts of the Website.</p>

      <h2>5. Your Choices</h2>

      <p>You have the right to opt-out of certain communications and the ability to update, correct, or delete your personal information.</p>

      <h2>6. Security</h2>

      <p>We implement security measures to protect your personal information. However, no data transmission over the Internet or method of electronic storage is 100% secure.</p>

      <h2>7. Changes to This Privacy Policy</h2>

      <p>We may update this Privacy Policy from time to time. The date of the latest revision will be indicated at the top of the Privacy Policy.</p>

      <h2>8. Contact Us</h2>

      <p>If you have any questions or concerns regarding this Privacy Policy, please contact us at <a href="mailto:undervaluedmusic18@gmail.com">undervaluedmusic18@gmail.com.</a></p> 
    </div>
  `;

    // Append elements to the modal
    modal.appendChild(closeButton);
    modal.appendChild(privacyPolicyContent);

    // Append the modal to the document body
    document.body.appendChild(modal);
  };

  return (
    <div className="sign-up-form">
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
          {usernameError && (
            <div className="error-message">{usernameError}</div>
          )}
        </div>
        <div>
          <label htmlFor="email" />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
          />
          {emailError && <div className="error-message">{emailError}</div>}
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
        </div>
        <div>
          <label htmlFor="confirmPassword" />
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="input-field"
          />
        </div>
        {passwordError && (
          <div className="password-error-message">{passwordError}</div>
        )}
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
          <input
            type="checkbox"
            id="agreedToTerms"
            name="agreedToTerms"
            checked={agreedToTerms}
            onChange={() => setAgreedToTerms(!agreedToTerms)}
          />
          <label htmlFor="agreedToTerms">
            I confirm that I have read and agree with the{" "}
            <span className="terms-link" onClick={handleTermsClick}>
              T&Cs
            </span>{" "}
            &{" "}
            <span className="terms-link" onClick={handlePrivacyPolicyClick}>
              Privacy Policy
            </span>
          </label>
        </div>
        <div>
          <button type="submit" className="sign-up-button">
            Sign Up
          </button>
        </div>
        {registrationError && (
          <div className="registration-error-message">{registrationError}</div>
        )}
      </form>
    </div>
  );
}

export default RegistrationForm;
