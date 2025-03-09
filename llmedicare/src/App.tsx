import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './components/auth/AuthProvider';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { ChatInterface } from './components/chat/ChatInterface';
import { Appointments } from './pages/Appointments';
import { Records } from './pages/Records';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/records" element={<Records />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;