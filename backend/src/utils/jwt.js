import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
