import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

import { decryptString } from '@/utils/encryption';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

async function getToken(tokenType: string, userId: string) {
  const encryptedAccessTokenData: string | null = await kv.get(
    `${userId}:${tokenType}`
  );

  if (encryptedAccessTokenData === null) {
    throw new Error('No encrypted access token found.');
  }

  const [encryptedAccessToken, initializationVector, authTag] =
    encryptedAccessTokenData.split(':');
  const accessToken = decryptString(
    encryptedAccessToken,
    ENCRYPTION_KEY,
    initializationVector,
    authTag
  );

  return accessToken;
}

export async function GET(request: NextRequest) {
  const accessToken = await getToken('accessToken', '__TIM__');

  console.log('ACCESS TOKEN', accessToken);

  return NextResponse.json({ message: 'Tokens requested.' }, { status: 200 });
}
