import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { auth } from "../utils/firebase-config";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { createNewUser, fetchUserById } from "../store/user-store";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const currentUser = useSelector((state) => state.user.selectedUser);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // await dispatch(fetchUserById(email)).unwrap();

      setMessage(`Welcome!`);
      navigate("/home");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // useEffect(() => {
  //   if (currentUser) {
  //     console.log(currentUser);
  //   }
  // }, [currentUser]); 

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // const user = userCredential.user;
  
      // const userData = { name, email, password };
      // await dispatch(createNewUser(userData)).unwrap();
  
      setMessage("Registration successful! Go to the Login tab to login.");
      setActiveTab("login");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container>
      <Content>
        <AppTitle>Welcome</AppTitle>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              setMessage("");
            }}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("signup");
              setMessage("");
            }}
          >
            Sign Up
          </button>
        </div>
        {message && <MessageBox className={message.includes("Error") ? "error" : "success"}>{message}</MessageBox>}
        {activeTab === "login" && (
          <form className="form" onSubmit={handleLoginSubmit}>
            <InputField
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <ActionButton type="submit">Login</ActionButton>
          </form>
        )}
        {activeTab === "signup" && (
          <form className="form" onSubmit={handleSignupSubmit}>
            <InputField
              type="text"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <InputField
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputField
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <ActionButton type="submit">Sign Up</ActionButton>
          </form>
        )}
      </Content>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Content = styled.div`
  background-color: rgba(255, 255, 255, 0.95);
  width: 400px;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;

  .tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 0.5rem;
  }

  .tab {
    background: none;
    border: none;
    font-size: 1.1rem;
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #757575;
    position: relative;
    margin: 0 0.5rem;
  }

  .tab.active {
    font-weight: 600;
    color: #3a86ff;
  }

  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -9px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #3a86ff;
    border-radius: 8px 8px 0 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 1.5rem;
  }
`;

const AppTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const InputField = styled.input`
  padding: 0.9rem 1rem;
  font-size: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
  background-color: #f9f9f9;

  &:focus {
    border-color: #3a86ff;
    box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.1);
    background-color: #fff;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const ActionButton = styled.button`
  background-color: #3a86ff;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background-color: #2667ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(58, 134, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MessageBox = styled.div`
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  
  &.error {
    background-color: #ffebee;
    color: #d32f2f;
    border: 1px solid #ffcdd2;
  }
  
  &.success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
  }
`;