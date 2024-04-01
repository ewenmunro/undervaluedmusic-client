import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../../assets/styles/header.css";
import { useAuth } from "../auth/AuthContext";

function Header() {
  const { isAuthenticated, refreshToken, dispatch } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          // User is logged in
          setAuthChecked(true);

          // Check if the page is being refreshed
          const isPageRefresh = sessionStorage.getItem("isPageRefresh");

          if (isPageRefresh) {
            // If it's a page refresh, execute refreshToken logic
            await refreshToken();
            // Clear the sessionStorage flag
            sessionStorage.removeItem("isPageRefresh");
          }
        } else {
          // User is not logged in, set authChecked to true
          setAuthChecked(true);
        }
      } catch (error) {
        console.error("Error initializing authentication:", error);
        // Handle any errors as needed
      }
    };

    // Set sessionStorage flag when the page is refreshed
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("isPageRefresh", "true");
    });

    initializeAuth();
  }, [dispatch, isAuthenticated, refreshToken]);

  return authChecked ? (
    <nav className="nav">
      {isAuthenticated.token ? (
        <>
          <NavLink to="/dashboard" className="nav-link">
            Home
          </NavLink>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>
          <NavLink to="/addmusic" className="nav-link">
            +Music
          </NavLink>
          <NavLink to="/myprofile" className="nav-link">
            My Profile
          </NavLink>
          <a
            href="https://ewenmunro.com/coffee"
            target="_blank"
            rel="noopener noreferrer"
          >
            Coffee
          </a>
          <a
            href="https://www.bonfire.com/undervaluedmusic/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shop
          </a>
          <NavLink to="/logout" className="nav-link">
            Logout
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>
          <a
            href="https://ewenmunro.com/coffee"
            target="_blank"
            rel="noopener noreferrer"
          >
            Coffee
          </a>
          <a
            href="https://www.bonfire.com/undervaluedmusic/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shop
          </a>
          <NavLink to="/login" className="nav-link">
            Login
          </NavLink>
          <NavLink to="/signup" className="nav-link">
            Sign Up
          </NavLink>
        </>
      )}
    </nav>
  ) : null;
}

export default Header;
