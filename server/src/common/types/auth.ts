import type { Types } from "mongoose";

import type { Role } from "../constants/roles.js";

/**
 * The slice of the user document attached to `req.user`. Deliberately narrow:
 * services should not depend on the full mongoose document.
 */
export interface AuthenticatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  hrId: Types.ObjectId | null;
  teamLeadId: Types.ObjectId | null;
  projectIds: Types.ObjectId[];
}

export interface AccessTokenPayload {
  userId: string;
  role: Role;
  type: "access";
}

export interface RefreshTokenPayload {
  userId: string;
  /** Rotation id — lets us invalidate a single refresh-token family. */
  jti: string;
  type: "refresh";
}
