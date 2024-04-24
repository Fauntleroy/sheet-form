import { OAuth2Client } from 'google-auth-library';

export const oAuthClient = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_APP_CLIENT_ID,
  process.env.GOOGLE_APP_CLIENT_SECRET,
  'http://localhost:3000'
);
