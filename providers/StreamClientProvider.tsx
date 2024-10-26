'use client';

import { ReactNode, useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';

// Firebase
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Components
import LoginForm from '@/components/LoginForm';
import Loader from '@/components/Loader';

// Actions
import { tokenProvider } from '@/actions/stream.actions';
import authContext from '@/auth/AuthContext';
import { DisplayNameContext } from './DisplayNameContext';

// API KEY
const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

/*
 ** ** ===========================================================================================
 ** ** ** Function [StreamVideoProvider]
 ** ** ===========================================================================================
 */
const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  /*
   ** **
   ** ** ** State
   ** **
   */
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { id } = useParams();
  const { user, isUserLoggedIn, isLoading } = useContext(authContext);
  const { displayName } = useContext(DisplayNameContext);  // Use the display name from context

  const [isLoadingSignInAnonymous, setIsLoadingSignInAnonymous] =
    useState(false);

  /*
   ** **
   ** ** ** Effects
   ** **
   */
  // Sign in user anonymously if the meeting id is present in url
  useEffect(() => {
    (async () => {
      // 1) Validate
      if (!id || isLoading || isUserLoggedIn) return;

      // 2) Signin user anonymously
      setIsLoadingSignInAnonymous(true);
      await signInAnonymously(auth);
      setIsLoadingSignInAnonymous(false);
    })();
  }, [id, isLoading, isUserLoggedIn]);

  // Init video client
  useEffect(() => {
    // 1) Validate
    if (!isUserLoggedIn) return;
    if (!API_KEY) throw new Error('Stream API key is missing');

    // 2) Create brand new token by passing userid to server action
    const tokenProviderRes = () =>
      tokenProvider(user.id)
        .then((token) => token)
        .catch(() => 'error');

    // 3) Return if failed to create token
    if (!tokenProviderRes) return;

    // 4) Init stream video client
    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user.id,
        name: user.name || displayName,
        image: user.photo,
      },
      tokenProvider: tokenProviderRes,
    });

    setVideoClient(client);
  }, [user, isUserLoggedIn, isLoading]);

  // if loading, show loader
  if (isLoading || isLoadingSignInAnonymous) return <Loader />;

  //  If failed to init, show login form
  if (!videoClient) return <LoginForm />;

  // Everything okay, show video stream
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
