import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { clearAllStoredSessions } from "./store/slices/sessionSlice";
import Home from "./pages/Home";
import ChatInterface from "./pages/ChatInterface.jsx";
import Appointments from "./pages/Appointments.jsx";
import Records from "./pages/Records.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import Message from "./pages/Message.jsx";
import { auth } from "./utils/firebase-config.js";
import { onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";

// Protected Route Component
function ProtectedRoute({ element, allowedRoles = [] }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  if (!user) {
    alert("Log In required!");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if the route requires specific roles
  if (allowedRoles.length > 0) {
    const userRole = user.role || "patient"; // Default to patient if role is not set
    if (!allowedRoles.includes(userRole)) {
      alert("You do not have permission to access this page!");
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  return element;
}

// App initialization component to clear localStorage
function AppInitializer() {
  useEffect(() => {
    // Clear all session-related data from localStorage on app start
    console.log(
      "App initializing: Clearing all session data from localStorage"
    );
    clearAllStoredSessions();
  }, []);

  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContainer>
          {/* Add the AppInitializer to clear localStorage on app start */}
          <AppInitializer />

          <div className="flex-1 flex flex-col">
            <MainContent>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route
                    path="/home"
                    element={<ProtectedRoute element={<Home />} />}
                  />
                  <Route path="/" element={<Login />} />
                  <Route
                    path="/chat"
                    element={<ProtectedRoute element={<ChatInterface />} />}
                  />
                  <Route
                    path="/appointments"
                    element={<ProtectedRoute element={<Appointments />} />}
                  />
                  <Route
                    path="/records"
                    element={<ProtectedRoute element={<Records />} />}
                  />
                  <Route
                    path="/profile"
                    element={<ProtectedRoute element={<Profile />} />}
                  />
                  <Route
                    path="/doctor-dashboard"
                    element={
                      <ProtectedRoute
                        element={<DoctorDashboard />}
                        allowedRoles={["doctor"]}
                      />
                    }
                  />
                  <Route
                    path="/matrix-chat"
                    element={<ProtectedRoute element={<Message />} />}
                  />
                </Routes>
              </div>
            </MainContent>
          </div>
        </AppContainer>
      </Router>
    </Provider>
  );
}

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f9fafb;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;
