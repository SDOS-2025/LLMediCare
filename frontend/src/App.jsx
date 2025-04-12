import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { clearAllStoredSessions } from "./store/slices/sessionSlice";
import Home from "./pages/Home";
import ChatInterface from "./pages/ChatInterface.jsx";
import Appointments from "./pages/Appointments2.jsx";
import Records from "./pages/Records.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import Message from "./pages/Message.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import styled from "styled-components";

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
          <AppInitializer />
          <div className="flex-1 flex flex-col">
            <MainContent>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Login />} />

                  {/* Patient Routes */}
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <ChatInterface />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <Appointments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/records"
                    element={
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <Records />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matrix-chat"
                    element={
                      <ProtectedRoute allowedRoles={["patient"]}>
                        <Message />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor Routes */}
                  <Route
                    path="/doctor-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["doctor"]}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctor/appointments"
                    element={
                      <ProtectedRoute allowedRoles={["doctor"]}>
                        <Appointments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctor/patients"
                    element={
                      <ProtectedRoute allowedRoles={["doctor"]}>
                        <Records />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctor/records"
                    element={
                      <ProtectedRoute allowedRoles={["doctor"]}>
                        <Records />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctor/chat"
                    element={
                      <ProtectedRoute allowedRoles={["doctor"]}>
                        <ChatInterface />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/message"
                    element={
                      <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                        <Message />
                      </ProtectedRoute>
                    }
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem 0;
`;
