import { useState } from 'react';

// Firebase
import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from 'firebase/auth';
import Spinner from './Spinner';

/*
 ** ** =============================================================================================
 ** ** ** Component [LoginForm]
 ** ** =============================================================================================
 */
const LoginForm = () => {
  /*
   ** **
   ** ** ** State
   ** **
   */
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingAnonymouse, setIsLoadingAnonymouse] = useState(false);

  /*
   ** **
   ** ** ** Methods
   ** **
   */

  // Google sign in
  const handleGoogleSignIn = async () => {
    try {
      // 1) Enable loading
      setIsLoadingGoogle(true);

      // 2) Init google auth provider
      const googleAuthProvider = new GoogleAuthProvider();

      // 3) Try to sign in with popup
      await signInWithPopup(auth, googleAuthProvider);

      // 4) Disable loading
      setIsLoadingGoogle(false);
    } catch (error) {
      alert('An error occured when tried to login, please try again.');
    }
  };

  // Anonymouse sign in
  const handleAnonymouseSignIn = async () => {
    try {
      // 1) Enable loading
      setIsLoadingAnonymouse(true);

      // 2) Try to sign in with anonymity
      await signInAnonymously(auth);

      // 3) Disable loading
      setIsLoadingAnonymouse(false);
    } catch (error) {
      alert('An error occured when tried to login, please try again.');
    }
  };

  return (
    <div className="absolute left-0 right-0 top-0 bottom-0">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  text-center p-8 flex-col gap-16 rounded-lg flex-col">
        <button
          disabled={isLoadingGoogle}
          onClick={handleGoogleSignIn}
          className="bg-red-500 w-[200px] text-white h-[60px]  rounded-md flex items-center justify-center m-auto"
        >
          {isLoadingGoogle ? <Spinner /> : 'Signin with Google'}
        </button>
        <p className=" py-4 text-white">or</p>
        <button
          disabled={isLoadingAnonymouse}
          onClick={handleAnonymouseSignIn}
          className="bg-transparent border-2 border-white w-[200px] h-[60px] text-white rounded-md flex items-center justify-center m-auto"
        >
          {isLoadingAnonymouse ? <Spinner /> : 'Login Anonymously'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
