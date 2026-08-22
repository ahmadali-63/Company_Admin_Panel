import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ROLE } from "../common/constants/roles.js";
import { userRepository } from "../modules/user/user.repository.js";

/**
 * Idempotent: safe to run on every deploy. Credentials come from the
 * environment, never from a literal in the repo.
 */
const seedAdmin = async (): Promise<void> => {
  await connectDB();

  const email = env.ADMIN_EMAIL.toLowerCase().trim();
  const existing = await userRepository.findByEmail(email);

  if (existing) {
    logger.info({ email }, "Admin account already exists — nothing to do");
    return;
  }

  await userRepository.create({
    name: "System Administrator",
    // Plaintext: the model's pre-save hook is the single hashing path.
    password: env.ADMIN_PASSWORD,
    email,
    role: ROLE.ADMIN,
    phone: "",
    department: "Administration",
    designation: "System Admin",
    hrId: null,
    projectIds: [],
    isActive: true,
    employeeId: "ADM001",
    joiningDate: new Date(),
    profileImage: "",
  });

  logger.info({ email }, "Admin created successfully");
};

seedAdmin()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    logger.error({ err: error }, "Admin seed failed");
    await disconnectDB();
    process.exit(1);
  });
