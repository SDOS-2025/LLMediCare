import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import styled from 'styled-components';

const LoginFormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  &:focus {
    border-color: #1e40af; // blue-800
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #1e40af; // blue-800
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #1a3765; // blue-700
  }
`;

const ErrorContainer = styled.div`
  background-color: #fdebeb;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  color: #721c24;
`;

const ForgotPasswordButton = styled.button`
  font-size: 14px;
  color: #1e40af; // blue-800
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const RememberMeInput = styled.input`
  margin-right: 8px;
`;

const RememberMeLabel = styled.label`
  font-size: 14px;
  color: #333;
`;

export const LoginForm = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        onLoginSuccess?.();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginFormContainer>
      <h2>Sign in to your account</h2>
      <p>
        Or{' '}
        <button
          onClick={onSwitchToRegister}
          className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          create a new account
        </button>
      </p>
      
      {error && (
        <ErrorContainer>
          {error}
        </ErrorContainer>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <RememberMeContainer>
          <RememberMeInput
            id="remember-me"
            name="remember-me"
            type="checkbox"
          />
          <RememberMeLabel htmlFor="remember-me">Remember me</RememberMeLabel>
        </RememberMeContainer>
        <ForgotPasswordButton type="button">
          Forgot your password?
        </ForgotPasswordButton>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </LoginFormContainer>
  );
};
