/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { app } from '../../firebase.config';
import { clearCookie } from '../api/aUTH.JS';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

export const AuthContext = createContext(null);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
const dispatch =useDispatch()
  // Create userc
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Log the result to ensure it contains the expected data
      console.log("Sign-in result:", userCredential);
      return userCredential;  // Return the complete UserCredential
    } catch (error) {
      console.error("Error during sign-in:", error.message);
      throw new Error("Login failed");
    }
  };
  
  // Sign in with Google
  const signInWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  // Reset password
  const resetPassword = email => {
    setLoading(true);
    return sendPasswordResetEmail(auth, email);
  };

  // Log out
  const logOut = async () => {
    setLoading(true);
    try {
      await clearCookie();
      await signOut(auth);
      setUser(null); // Ensure user state is cleared immediately
      console.log('Logged out successfully');
      Swal.fire(
        "Success",
        "Your Account has logged out !",
        "success"
      );
      dispatch({ type: 'CLEAR_CART' });

    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      currentUser => {
        setUser(currentUser);
        setLoading(false);
      },
      error => {
        console.error('Error in onAuthStateChanged:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    loading,
    setLoading,
    createUser,
    signIn,
    signInWithGoogle,
    resetPassword,
    logOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
