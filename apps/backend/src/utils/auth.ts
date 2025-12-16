import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Hashes a plain password using bcrypt
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Verifies a plain password against a bcrypt hash
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Signs a JWT token with the user ID
export function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}