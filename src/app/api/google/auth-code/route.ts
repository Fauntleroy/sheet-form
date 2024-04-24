import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

import { encryptString } from '@/utils/encryption';
import { oAuthClient } from '@/app/clients/google';

const ENCRYPTION_KEY: string = process.env.ENCRYPTION_KEY;

async function storeToken(token: any, tokenType: string, userId: string) {
  kv.set(
    `${userId}:${tokenType}`,
    `${token.encryptedString}:${token.initializationVector}:${token.authTag}`
  );
}

export async function POST(request: NextRequest) {
  try {
    // csrf header match
    const xRequestedWith = request.headers.get('X-Requested-With');
    const isValidRequest = xRequestedWith === 'fetch'; // todo: ???

    if (!isValidRequest) {
      throw new Error('Invalid authentication.', {
        cause: 'X-Requested-With header failed to match expectation.'
      });
    }

    const body = await request.json();

    // generate access token and refresh token
    const tokenResponse = await oAuthClient.getToken(body.authCode);
    const accessToken = tokenResponse.tokens.access_token;
    const refreshToken = tokenResponse.tokens.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new Error('No access token or refresh token returned');
    }

    // get user data
    const tokenInfo = await oAuthClient.getTokenInfo(accessToken);
    const email = tokenInfo.email;

    if (!email) {
      throw new Error('No email address associated with access token');
    }

    // encrypt tokens
    const encryptedAccessToken = encryptString(accessToken, ENCRYPTION_KEY);
    const encryptedRefreshToken = encryptString(refreshToken, ENCRYPTION_KEY);

    // store access token and refresh token for user
    storeToken(encryptedAccessToken, 'accessToken', email);
    storeToken(encryptedRefreshToken, 'refreshToken', email);

    // return token
    return NextResponse.json(
      { message: 'Tokens successfully generated and stored.', accessToken },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}
