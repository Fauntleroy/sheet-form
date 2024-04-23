import crypto from 'crypto';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENCRYPTION_KEY: string;
    }
  }
}

export function encryptString(string: string, encryptionKey: string) {
  const initializationVector = crypto.randomBytes(12).toString('base64');
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'base64'),
    Buffer.from(initializationVector, 'base64')
  );
  let encryptedString = cipher.update(string, 'utf8', 'base64');
  encryptedString += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  return { encryptedString, initializationVector, authTag };
}

export function decryptString(
  encryptedString: string,
  encryptionKey: string,
  initializationVector: string,
  authTag: string
) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'base64'),
    Buffer.from(initializationVector, 'base64')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  let string = decipher.update(encryptedString, 'base64', 'utf8');
  string += decipher.final('utf8');

  return string;
}
