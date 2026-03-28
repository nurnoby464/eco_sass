// src/config/jwt.config.ts
import type { StringValue } from "ms";

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
};

export const jwtConfig = {
  access: {
    secret   : requireEnv("JWT_SECRET"),
    expiresIn: requireEnv("JWT_EXPIRES_IN") as StringValue,
  },
  refresh: {
    secret   : requireEnv("JWT_REFRESH_SECRET"),
    expiresIn: requireEnv("JWT_REFRESH_EXPIRES_IN") as StringValue,
  },
} as const;