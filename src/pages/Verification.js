import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// assets/styles
import "../assets/styles/verification.css";

// api base url
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function Verification() {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/api/users/verification/${token}`
        );

        setVerificationStatus(response.data.success);
      } catch (error) {
        console.error("Verification failed:", error);
        setVerificationStatus(false);
      }
    };

    verifyUser();
  }, [token]);

  return (
    <div className="verification">
      <h1>Email Verification Status</h1>
      {verificationStatus === true ? (
        <p className="verification-success">
          Your account has been successfully verified. You can now{" "}
          <a href="/login">login</a>.
        </p>
      ) : (
        <p className="verification-error">
          Verification failed. Please contact support for assistance:{" "}
          <a href="mailto:undervaluedmusic18@gmail.com">
            undervaluedmusic18@gmail.com
          </a>
        </p>
      )}
    </div>
  );
}

export default Verification;
