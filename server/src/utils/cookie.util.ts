import { Request } from 'express';

export const getCookieOptions = (req: Request) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';
  
  return {
    httpOnly: true,
    secure: isProduction && isHttps,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
  };
}; 