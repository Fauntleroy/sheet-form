'use client';

import { useRef, useContext } from 'react';

import Script from 'next/script';
import { AppContext } from '@/context';

const GOOGLE_APP_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_CLIENT_ID;
const GOOGLE_APP_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

declare global {
  interface Window {
    google: any;
  }
}

async function sendAuthCode(authCode: string) {
  try {
    const response = await fetch('/api/google/auth-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'fetch'
      },
      body: JSON.stringify({
        authCode
      })
    });
    const responseJson = await response.json();

    return {
      accessToken: responseJson.accessToken
    };
  } catch (error) {
    console.error(error);
  }
}

export function Authorization() {
  const googleAuthClientRef = useRef(null);
  const { setAccessToken } = useContext(AppContext);

  interface AuthCompleteArguments {
    code: string;
  }

  async function handleAuthComplete(
    { code, ...other }: AuthCompleteArguments,
    ...restArgs: any[]
  ) {
    const { accessToken } = await sendAuthCode(code);
    setAccessToken(accessToken);
  }

  function handleGoogleAuthLoad() {
    googleAuthClientRef.current = window.google.accounts.oauth2.initCodeClient({
      ux_mode: 'popup',
      client_id: GOOGLE_APP_CLIENT_ID,
      scope: GOOGLE_APP_SCOPES.join(' '),
      callback: handleAuthComplete
    });
  }

  function handleAuthButtonClick() {
    if (googleAuthClientRef.current === null) {
      console.error('handleAuthButtonClick: googleAuthClientRef is null');
      return;
    }

    googleAuthClientRef.current.requestCode();
  }

  return (
    <section>
      <h2>Authorization</h2>
      <p>You must authorize Sheet Form to edit your sheets.</p>
      <button onClick={handleAuthButtonClick}>Authorize Sheet Form</button>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={handleGoogleAuthLoad}
      />
    </section>
  );
}
