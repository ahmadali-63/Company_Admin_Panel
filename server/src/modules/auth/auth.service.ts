import { ERROR_MESSAGES } from "../../common/constants/messages.js";
import { ROLE } from "../../common/constants/roles.js";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../../common/errors/AppError.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import type { UserDocument } from "../user/user.model.js";
import { userRepository } from "../user/user.repository.js";
import type { LoginInput, SignupInput } from "./auth.schema.js";
import {
  issueTokenPair,
  tokenVersionOf,
  verifyRefreshToken,
  type TokenPair,
} from "./token.service.js";

const toPublicUser = (user: UserDocument) => ({
  _id: user._id,
  employeeId: user.employeeId,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  designation: user.designation,
  phone: user.phone,
  projectIds: user.projectIds,
  hrId: user.hrId,
  isActive: user.isActive,
  joiningDate: user.joiningDate,
  profileImage: user.profileImage,
  lastLogin: user.lastLogin,
});

export const authService = {
  async login(input: LoginInput): Promise<TokenPair & { user: unknown }> {
    const user = await userRepository.findByEmailWithPassword(input.email);

    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new ForbiddenError(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    const passwordMatches = await user.comparePassword(input.password);

    if (!passwordMatches) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    user.lastLogin = new Date();
    await user.save();

    return {
      ...issueTokenPair(user._id.toString(), user.role, user.tokenVersion),
      user: toPublicUser(user),
    };
  },

  async signup(input: SignupInput): Promise<TokenPair & { user: unknown }> {
    const existing = await userRepository.findByEmail(input.email);

    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }

    const count = await userRepository.count({ role: ROLE.EMPLOYEE });
    const employeeId = `EMP-${String(count + 101).padStart(3, "0")}`;

    const user = await userRepository.create({
      employeeId,
      name: input.name,
      email: input.email,
      password: input.password,
      role: ROLE.EMPLOYEE,
      phone: input.phone,
      department: input.department,
      designation: input.designation,
      isActive: true,
      joiningDate: new Date(),
    });

    return {
      ...issueTokenPair(user._id.toString(), user.role, user.tokenVersion),
      user: toPublicUser(user),
    };
  },

  async refresh(refreshToken: string): Promise<TokenPair & { user: unknown }> {
    const payload = verifyRefreshToken(refreshToken);

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw new ForbiddenError(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    if (tokenVersionOf(payload) !== user.tokenVersion) {
      throw new UnauthorizedError("Refresh token has been revoked.");
    }

    user.tokenVersion += 1;
    await user.save();

    return {
      ...issueTokenPair(user._id.toString(), user.role, user.tokenVersion),
      user: toPublicUser(user),
    };
  },

  async logout(actor: AuthenticatedUser): Promise<void> {
    await userRepository.model
      .updateOne({ _id: actor._id }, { $inc: { tokenVersion: 1 } })
      .exec();
  },

  async changePassword(
    actor: AuthenticatedUser,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await userRepository.findByIdWithPassword(actor._id);

    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const matches = await user.comparePassword(currentPassword);

    if (!matches) {
      throw new UnauthorizedError("Current password is incorrect.");
    }

    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();
  },
};
