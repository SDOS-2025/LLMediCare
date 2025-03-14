import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Home from './pages/Home';
import ChatInterface from './pages/ChatInterface.jsx';
// import Appointments from './pages/Appointments.jsx';
import Appointments from './pages/Appointments2.jsx';
import Records from './pages/Records.jsx';
import Login  from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import { auth } from './utils/firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';
import styled from 'styled-components';

// Protected Route Component
function ProtectedRoute({ element }) {
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

  if (loading) return null; // Avoid redirect flicker

  if (!user) {
    alert('Log In required!');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return element;
}

export default function App() {

  return (
    <Provider store={store}>
      <Router>
        <AppContainer>
          <div className="flex-1 flex flex-col">
            <MainContent>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
                  <Route path="/" element={<Login />} />
                  <Route path="/chat" element={<ProtectedRoute element={<ChatInterface />} />} />
                  <Route path="/appointments" element={<ProtectedRoute element={<Appointments />} />} />
                  <Route path="/records" element={<ProtectedRoute element={<Records />} />} />
                  <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
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