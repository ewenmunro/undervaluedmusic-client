import React, { useState } from "react";
import "../assets/styles/signup.css";

// components/auth
import RegistrationForm from "../components/auth/RegistrationForm";

function Signup() {
  const [isRegistrationSuccessful, setIsRegistrationSuccessful] =
    useState(false);

  const onRegister = (success) => {
    setIsRegistrationSuccessful(success);
  };

  return (
    <div className="login">
      <h1>Sign Up</h1>
      <RegistrationForm onRegister={onRegister} />
      {isRegistrationSuccessful && (
        <div className="registration-success-message">
          <p>Registration was successful!</p>
          <p>
            Check your email to verify your account. If you didn't receive an
            email from us, check your junk folder in case our email landed
            there. And if our email cannot be found in your inbox or junk
            folder, contact us via{" "}
            <a href="mailto:undervaluedmusic18@gmail.com">
              undervaluedmusic18@gmail.com.
            </a>
          </p>
          <p>
            You have 48-72hrs to verify your account. If you don't verify your
            account within this time, you'll have to sign up again.
          </p>
          <p>
            Once you've successfully verified your account, you can log in to
            Undervalued Music.
          </p>
        </div>
      )}
    </div>
  );
}

export default Signup;
