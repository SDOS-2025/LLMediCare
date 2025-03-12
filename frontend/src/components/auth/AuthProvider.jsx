import React, { createContext, useEffect, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '../../store/slices/authSlice';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../../utils/config';

export const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setLoading(true));
      try {
        if (user) {
          dispatch(setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            role: user.photoURL || 'patient' // We store role in photoURL for simplicity
          }));
        } else {
          dispatch(setUser(null));
        }
        setInitialized(true);
      } catch (error) {
        console.error('Error processing auth state:', error);
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  // Provide auth-related functions
  const authContextValue = {
    initialized,
    login: async (email, password) => {
      try {
        dispatch(setLoading(true));
        await signInWithEmailAndPassword(auth, email, password);
        return true;
      } catch (error) {
        console.error('Error logging in:', error);
        dispatch(setError(error.message));
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    register: async (email, password, displayName = '', role = 'patient') => {
      try {
        dispatch(setLoading(true));
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update the user profile with displayName and role (stored in photoURL)
        await updateProfile(userCredential.user, {
          displayName: displayName || email.split('@')[0],
          photoURL: role
        });
        
        return true;
      } catch (error) {
        console.error('Error registering:', error);
        dispatch(setError(error.message));
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
    logout: async () => {
      try {
        dispatch(setLoading(true));
        await signOut(auth);
        return true;
      } catch (error) {
        console.error('Error logging out:', error);
        dispatch(setError(error.message));
        return false;
      } finally {
        dispatch(setLoading(false));
      }
    },
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
