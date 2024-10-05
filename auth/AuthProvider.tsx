'use client';

import React, { useEffect, useState } from 'react';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Auth Context
import AuthContext from './AuthContext';

/*
 ** **
 ** ** ** Default state
 ** **
 */
const defaultState = {
  isUserLoggedIn: false,
  user: { id: '', name: '', photo: '', isAnonymous: false },
  isLoading: true,
};

/*
 ** ** ================================================================================================
 ** ** ** Props [AuthProviderProps]
 ** ** ================================================================================================
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/*
 ** ** ================================================================================================
 ** ** ** Components [AuthProvider]
 ** ** ================================================================================================
 */
const AuthProvider = ({ children }: AuthProviderProps) => {
  /*
   ** **
   ** ** ** State & Reducers
   ** **
   */
  const [authState, setAuthState] = useState(defaultState);

  /*
   ** **
   ** ** ** Side effects
   ** **
   */
  useEffect(() => {
    // 1) Enable loading
    setAuthState((state) => ({ ...state, isLoading: true }));

    // 2) Subscribe to on auth state changes
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user)
        setAuthState((state) => ({
          ...state,
          user: {
            id: user.uid,
            name: user.displayName || '',
            photo: user.photoURL || '',
            isAnonymous: user.isAnonymous,
          },
          isUserLoggedIn: true,
          isLoading: false,
        }));
      else
        setAuthState((state) => ({
          ...state,
          isUserLoggedIn: false,
          isLoading: false,
        }));
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
