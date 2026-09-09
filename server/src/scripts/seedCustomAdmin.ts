import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { connectDB, disconnectDB } from "../config/db.js";
import { logger } from "../config/logger.js";
import { ROLE } from "../common/constants/roles.js";
import { userRepository } from "../modules/user/user.repository.js";

const rl = readline.createInterface({ input, output });

const ask = async (question: string, defaultValue: string = ""): Promise<string> => {
  const answer = await rl.question(`\x1b[36m? \x1b[0m${question}${defaultValue ? ` \x1b[90m(${defaultValue})\x1b[0m` : ""} `);
  return answer.trim() || defaultValue;
};

const seedCustomAdmin = async (): Promise<void> => {
  console.log("\n\x1b[1m\x1b[35m=== 🌟 Custom Admin Seeder ===\x1b[0m\n");
  
  const name = await ask("Enter admin's full name:");
  if (!name) {
    console.log("\x1b[31mName is required.\x1b[0m");
    return;
  }
  
  const email = (await ask("Enter admin's email:")).toLowerCase();
  if (!email || !email.includes("@")) {
    console.log("\x1b[31mValid email is required.\x1b[0m");
    return;
  }
  
  const password = await ask("Enter temporary password:", "Admin@12345");
  const department = await ask("Enter department:", "Administration");
  const designation = await ask("Enter designation:", "System Admin");
  const phone = await ask("Enter phone number (optional):", "");

  console.log("\n\x1b[33mConnecting to database...\x1b[0m");
  await connectDB();

  const existing = await userRepository.findByEmail(email);

  if (existing) {
    console.log(`\n\x1b[31m❌ Admin account with email ${email} already exists.\x1b[0m\n`);
    return;
  }

  await userRepository.create({
    name,
    password,
    email,
    role: ROLE.ADMIN,
    phone,
    department,
    designation,
    hrId: null,
    teamLeadId: null,
    projectIds: [],
    isActive: true,
  });

  console.log(`\n\x1b[32m✅ Successfully created admin: ${name} (${email})\x1b[0m\n`);
};

seedCustomAdmin()
  .then(async () => {
    rl.close();
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    logger.error({ err: error }, "Custom admin seed failed");
    rl.close();
    await disconnectDB();
    process.exit(1);
  });
