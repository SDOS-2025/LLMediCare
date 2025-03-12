import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Close"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {mode === 'login' ? (
          <LoginForm 
            onLoginSuccess={onClose}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm 
            onRegisterSuccess={onClose}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>
    </div>
  );
};
