import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import styled from 'styled-components';
import { Button as StyledButton } from '../ui/Button';

const RegisterFormContainer = styled.div`
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

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
`;

const ErrorContainer = styled.div`
  background-color: #fdebeb;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  color: #721c24;
`;

const TermsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const TermsLink = styled.button`
  font-size: 14px;
  color: #1e40af; // blue-800
  text-decoration: underline;
  background-color: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
`;

export const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await register(email, password, name, role);
      if (success) {
        onRegisterSuccess?.();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. ' + (err.message || 'Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterFormContainer>
      <h2>Create your account</h2>
      <p>
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          Sign in
        </button>
      </p>
      
      {error && (
        <ErrorContainer>
          {error}
        </ErrorContainer>
      )}
      
      <form onSubmit={handleSubmit}>
        <Label>
          Full Name
        </Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Label>
          Email address
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Label>
          Password
        </Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Label>
          Confirm Password
        </Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <Label>
          I am a
        </Label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Administrator</option>
        </select>
        
        <TermsContainer>
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
          />
          <Label htmlFor="terms">
            I agree to the{' '}
            <TermsLink
              type="button"
              onClick={() => window.alert('Terms of Service would open here')}
            >
              Terms of Service
            </TermsLink>{' '}
            and{' '}
            <TermsLink
              type="button"
              onClick={() => window.alert('Privacy Policy would open here')}
            >
              Privacy Policy
            </TermsLink>
          </Label>
        </TermsContainer>
        
        <StyledButton
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </StyledButton>
      </form>
    </RegisterFormContainer>
  );
};
