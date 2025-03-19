'use client'

import React, { useState, useCallback } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_URL || 'https://apiv2.gymforce.in';

interface User {
  name: string;
  email: string;
}

export default function Home(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = useCallback(async (credentialResponse: CredentialResponse): Promise<void> => {
    // console.log('Login Success', credentialResponse);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received');
      }
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${API_URL}/auth-receiver`,
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          // 'Cookie': 'sessionid=mwrrzr6p0h1ictyj2oa3m9e46ztajmyp'
        },
        data: {
          'credential': credentialResponse.credential
        },
        withCredentials: true
      };

      const response = await axios(config);

      console.log('Response from /auth-receiver:', JSON.stringify(response.data));
      
      // Assuming the response includes user data
      setUser(response.data.user);
    } catch (error) {
      console.error('Error processing login:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }, []);

  const handleGoogleError = useCallback((): void => {
    console.log('Login Failed');
    setError('Login failed. Please try again.');
  }, []);

  const handleSignOut = useCallback((): void => {
    setUser(null);
    setError(null);
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <div>
        <h1>Google Sign-In Example</h1>
        {!user && !error && (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        )}
        {error && (
          <div>
            <p>Error: {error}</p>
            <button onClick={() => setError(null)}>Try Again</button>
          </div>
        )}
        {user && (
          <div>
            <h2>User Logged in</h2>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}