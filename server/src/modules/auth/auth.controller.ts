import type { Request, Response } from "express";

import { SUCCESS_MESSAGES } from "../../common/constants/messages.js";
import type { AuthedRequest } from "../../common/types/http.js";
import { authService } from "./auth.service.js";
import type {
  ChangePasswordInput,
  LoginInput,
  RefreshInput,
  SignupInput,
} from "./auth.schema.js";

export const authController = {
  async login(
    req: Request<Record<string, string>, unknown, LoginInput>,
    res: Response,
  ) {
    const { token, refreshToken, user } = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
      token,
      refreshToken,
      user,
    });
  },

  async signup(
    req: Request<Record<string, string>, unknown, SignupInput>,
    res: Response,
  ) {
    const { token, refreshToken, user } = await authService.signup(req.body);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.REGISTRATION_SUCCESSFUL,
      token,
      refreshToken,
      user,
    });
  },

  async refresh(
    req: Request<Record<string, string>, unknown, RefreshInput>,
    res: Response,
  ) {
    const { token, refreshToken, user } = await authService.refresh(
      req.body.refreshToken,
    );

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
      token,
      refreshToken,
      user,
    });
  },

  async logout(req: AuthedRequest, res: Response) {
    await authService.logout(req.user);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL,
    });
  },

  async changePassword(
    req: AuthedRequest<Record<string, string>, unknown, ChangePasswordInput>,
    res: Response,
  ) {
    await authService.changePassword(
      req.user,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please sign in again.",
    });
  },

  me(req: AuthedRequest, res: Response) {
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.AUTHENTICATION_SUCCESSFUL,
      user: req.user,
    });
  },
};
