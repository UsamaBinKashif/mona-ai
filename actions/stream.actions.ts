'use server';

import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

/*
 ** ** ============================================================================================
 ** ** ** Creates a token with data from logged in user object
 ** ** ============================================================================================
 */
export const tokenProvider = async (userId: string) => {
  // 1) Check for user/auth
  if (!userId) throw new Error('User is not authenticated');

  // 2) Check for keys
  if (!STREAM_API_KEY) throw new Error('Stream API key secret is missing');
  if (!STREAM_API_SECRET) throw new Error('Stream API secret is missing');

  // 3) Init stream clinet
  const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

  // 4) Create token
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;
  const token = streamClient.createToken(userId, expirationTime, issuedAt);

  // 5) Return Token
  return token;
};
