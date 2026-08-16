import type { AuthenticatedUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      /** Populated by `authenticate` middleware. */
      user?: AuthenticatedUser;
    }
  }
}

export {};
