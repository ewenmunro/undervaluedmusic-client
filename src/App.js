import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

// components/routes
import AllRoutes from "./components/routes/Route";

// components/layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// component/auth
import { AuthProvider } from "./components/auth/AuthContext";
import usePageLoading from "./components/auth/Loading";

// assets/styles
import "./assets/styles/loading.css";
import "./assets/styles/App.css";

function App() {
  const isLoading = usePageLoading();

  return (
    <AuthProvider>
      <Router>
        <header>
          <Header />
        </header>
        <main>
          {isLoading ? (
            <p className="loading-message">Refreshing page...</p>
          ) : (
            <AllRoutes />
          )}
        </main>
        <footer>
          <Footer />
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;
