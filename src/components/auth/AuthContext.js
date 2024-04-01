import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

export const useAuth = () => {
  return useContext(AuthContext);
};

const LOGIN = "LOGIN";

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "LOGIN":
          if (action.token) {
            localStorage.setItem("accessToken", action.token);
          } else {
            console.error("No access token provided.");
          }

          return {
            token: action.token,
            isAuthenticated: true,
            user: action.user,
          };
        case "LOGOUT":
          localStorage.removeItem("accessToken");
          localStorage.removeItem("accessTokenExpiration");
          return {
            token: null,
            isAuthenticated: false,
            user: null,
          };
        default:
          return state;
      }
    },
    {
      token: null,
      isAuthenticated: false,
      user: null,
    }
  );

  const refreshToken = useCallback(async () => {
    try {
      const refresh = localStorage.getItem("refreshToken");

      if (refresh) {
        const response = await axios.post(`${apiBaseUrl}/api/auth/refresh`, {
          refresh,
        });

        if (response.status === 200) {
          const newAccessToken = response.data.newAccessToken;
          const newRefreshToken = response.data.newRefreshToken;
          const newAccessTokenExpiration =
            response.data.newAccessTokenExpiration;
          const userData = response.data.user;

          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem(
            "accessTokenExpiration",
            newAccessTokenExpiration
          );

          dispatch({
            type: LOGIN,
            token: newAccessToken,
            user: userData,
          });

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      const token = localStorage.getItem("accessToken");
      const expiration = localStorage.getItem("accessTokenExpiration");

      if (token && expiration) {
        const expirationTimestamp = parseInt(expiration, 10);
        const expirationDate = new Date(expirationTimestamp);
        const newDate = new Date();

        if (newDate > expirationDate) {
          const success = await refreshToken();

          if (!success) {
            dispatch({ type: "LOGOUT" });
          }
        }
      }
    };

    refreshTokenIfNeeded();

    const refreshInterval = setInterval(refreshTokenIfNeeded, 30 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, refreshToken, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
