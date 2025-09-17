import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          emailVerified: currentUser.emailVerified,
          isAdmin: currentUser.email?.endsWith('@poornima.edu.in') || false
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Login error:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Login was cancelled' };
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        return { success: false, error: 'Account exists with different login method' };
      } else {
        return { success: false, error: 'Login failed. Please try again.' };
      }
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed. Please try again.' };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
