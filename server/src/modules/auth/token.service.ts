import { randomUUID } from "node:crypto";

import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../../config/env.js";
import type { Role } from "../../common/constants/roles.js";
import { UnauthorizedError } from "../../common/errors/AppError.js";
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../../common/types/auth.js";

const ISSUER = "company-admin-panel";

export interface TokenPair {
  token: string;
  refreshToken: string;
}

export const signAccessToken = (userId: string, role: Role): string => {
  const payload: AccessTokenPayload = { userId, role, type: "access" };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: ISSUER,
  } as SignOptions);
};

/**
 * `jti` encodes the user's current `tokenVersion`. Bumping that version on
 * logout / password change / deactivation invalidates every refresh token
 * already in the wild without storing them server-side.
 */
export const signRefreshToken = (userId: string, tokenVersion: number): string => {
  const payload: RefreshTokenPayload = {
    userId,
    jti: `${tokenVersion}:${randomUUID()}`,
    type: "refresh",
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: ISSUER,
  } as SignOptions);
};

export const issueTokenPair = (
  userId: string,
  role: Role,
  tokenVersion: number,
): TokenPair => ({
  token: signAccessToken(userId, role),
  refreshToken: signRefreshToken(userId, tokenVersion),
});

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: ISSUER,
  }) as AccessTokenPayload;

  // Reject a refresh token presented as a bearer credential.
  if (decoded.type !== "access") {
    throw new UnauthorizedError("Invalid authentication token.");
  }

  return decoded;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: ISSUER,
  }) as RefreshTokenPayload;

  if (decoded.type !== "refresh") {
    throw new UnauthorizedError("Invalid refresh token.");
  }

  return decoded;
};

export const tokenVersionOf = (payload: RefreshTokenPayload): number =>
  Number.parseInt(payload.jti.split(":")[0] ?? "", 10);
