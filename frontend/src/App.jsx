import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './components/auth/AuthProvider';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { ChatInterface } from './components/chat/ChatInterface';
import { Appointments } from './pages/Appointments';
import { Records } from './pages/Records';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f9fafb; // gray-50
`;

const SidebarContainer = styled.div`
  transition: transform 0.3s ease-in-out;
  ${props => props.sidebarOpen ? 'transform: translateX(0);' : 'transform: translateX(-100%);'}
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <AppContainer>
            {/* Sidebar */}
            <SidebarContainer sidebarOpen={sidebarOpen}>
              <Sidebar />
            </SidebarContainer>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
              <MainContent>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<ChatInterface />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/records" element={<Records />} />
                  </Routes>
                </div>
              </MainContent>
            </div>
          </AppContainer>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
