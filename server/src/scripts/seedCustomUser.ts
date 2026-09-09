import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { connectDB, disconnectDB } from "../config/db.js";
import { logger } from "../config/logger.js";
import { ROLES, type Role } from "../common/constants/roles.js";
import { userRepository } from "../modules/user/user.repository.js";
import type { Types } from "mongoose";

const rl = readline.createInterface({ input, output });

const ask = async (question: string, defaultValue: string = ""): Promise<string> => {
  const answer = await rl.question(`\x1b[36m? \x1b[0m${question}${defaultValue ? ` \x1b[90m(${defaultValue})\x1b[0m` : ""} `);
  return answer.trim() || defaultValue;
};

const askOptions = async (question: string, options: string[]): Promise<string> => {
  let choice = -1;
  while (choice < 0 || choice >= options.length) {
    console.log(`\n\x1b[36m? \x1b[0m${question}`);
    options.forEach((opt, idx) => console.log(`  \x1b[33m${idx + 1})\x1b[0m ${opt}`));
    const answer = await rl.question(`\x1b[90mSelect an option (1-${options.length}): \x1b[0m`);
    choice = parseInt(answer, 10) - 1;
  }
  return options[choice] as string;
};

const seedCustomUser = async (): Promise<void> => {
  console.log("\n\x1b[1m\x1b[35m=== 🌟 Custom User Seeder ===\x1b[0m\n");
  
  const name = await ask("Enter user's full name:");
  if (!name) {
    console.log("\x1b[31mName is required.\x1b[0m");
    return;
  }
  
  const email = (await ask("Enter user's email:")).toLowerCase();
  if (!email || !email.includes("@")) {
    console.log("\x1b[31mValid email is required.\x1b[0m");
    return;
  }
  
  const password = await ask("Enter temporary password:", "User@12345");
  
  // Prompt for role
  const role = await askOptions("Select user role:", [...ROLES]) as Role;
  
  const department = await ask("Enter department:", "General");
  const designation = await ask("Enter designation:", "Employee");
  const phone = await ask("Enter phone number (optional):", "");

  console.log("\n\x1b[33mConnecting to database...\x1b[0m");
  await connectDB();

  const existing = await userRepository.findByEmail(email);

  if (existing) {
    console.log(`\n\x1b[31m❌ User account with email ${email} already exists.\x1b[0m\n`);
    return;
  }
  
  let hrId = null;
  let teamLeadId = null;

  // Since it's a CLI script for custom users, we just skip complex hierarchy resolution for now 
  // or fetch possible HRs/Team leads if required, but for simplicity we will just insert null
  // The user can assign hierarchy from the admin panel later.

  if (role === "team_lead" || role === "team_member") {
     console.log(`\x1b[90mNote: You chose ${role}. HR and Team Lead assignments can be configured from the Admin Panel.\x1b[0m`);
  }

  await userRepository.create({
    name,
    password,
    email,
    role,
    phone,
    department,
    designation,
    hrId,
    teamLeadId,
    projectIds: [],
    isActive: true,
  });

  console.log(`\n\x1b[32m✅ Successfully created user: ${name} (${email}) as ${role}\x1b[0m\n`);
};

seedCustomUser()
  .then(async () => {
    rl.close();
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    logger.error({ err: error }, "Custom user seed failed");
    rl.close();
    await disconnectDB();
    process.exit(1);
  });
