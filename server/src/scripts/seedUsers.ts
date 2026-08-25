import { connectDB, disconnectDB } from "../config/db.js";
import { logger } from "../config/logger.js";
import { ROLE, type Role } from "../common/constants/roles.js";
import { UserModel, type UserDocument } from "../modules/user/user.model.js";

interface SeedUserDef {
  name: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
  hrEmail?: string;
  teamLeadEmail?: string;
  phone?: string;
  isActive?: boolean;
}

const DEFAULT_PASSWORD = "Name12345";

/**
 * Users specification provided for seeding.
 */
const SEED_USERS: SeedUserDef[] = [
  // 1. Admin
  {
    name: "System Administrator",
    email: "admin@company.com",
    role: ROLE.ADMIN,
    department: "Administration",
    designation: "System Administrator",
    isActive: true,
  },

  // 2. HRs (Top Level)
  {
    name: "Naveed Ullah Khan",
    email: "naveed@gmail.com",
    role: ROLE.HR,
    department: "Web Development",
    designation: "QTP Head",
    isActive: true,
  },
  {
    name: "Abdullah Imran",
    email: "abdullah228@gmail.com",
    role: ROLE.HR,
    department: "IT",
    designation: "Senior HR",
    isActive: true,
  },
  {
    name: "Ahmad Ali",
    email: "ahmad363@gmail.com",
    role: ROLE.HR,
    department: "Quick Top Up",
    designation: "Senior HR",
    isActive: true,
  },
  {
    name: "Ahmad Ali",
    email: "ahmad63@gmail.com",
    role: ROLE.HR,
    department: "Human Resources",
    designation: "Senior HR",
    isActive: true,
  },

  // 3. Team Leads (Report to HR)
  {
    name: "Hamza Shakir",
    email: "hamza@gmail.com",
    role: ROLE.TEAM_LEAD,
    department: "QTP",
    designation: "Senior Team Lead",
    hrEmail: "naveed@gmail.com",
    isActive: true,
  },
  {
    name: "Nur Sultan",
    email: "sultan@gmail.com",
    role: ROLE.TEAM_LEAD,
    department: "Web Development",
    designation: "Senior Designer",
    hrEmail: "ahmad363@gmail.com",
    isActive: true,
  },
  {
    name: "Qasim Ali",
    email: "qasim@gmail.com",
    role: ROLE.TEAM_LEAD,
    department: "Dean Office",
    designation: "Associate Dean",
    hrEmail: "ahmad363@gmail.com",
    isActive: true,
  },
  {
    name: "M Shaheer",
    email: "shaheer@gmail.com",
    role: ROLE.TEAM_LEAD,
    department: "IT",
    designation: "JR Team Lead",
    hrEmail: "abdullah228@gmail.com",
    isActive: true,
  },
  {
    name: "Neha Ahmad",
    email: "neha75@gmail.com",
    role: ROLE.TEAM_LEAD,
    department: "Human Resources",
    designation: "Senior Team Lead",
    hrEmail: "ahmad63@gmail.com",
    isActive: true,
  },

  // 4. Team Members (Report to Team Lead & HR)
  {
    name: "M Mahad",
    email: "mahad@gmail.com",
    role: ROLE.TEAM_MEMBER,
    department: "Skill development",
    designation: "JR Team Member",
    teamLeadEmail: "neha75@gmail.com",
    hrEmail: "ahmad63@gmail.com",
    isActive: true,
  },
  {
    name: "Junaid",
    email: "junaid@gmail.com",
    role: ROLE.TEAM_MEMBER,
    department: "Technical Engr",
    designation: "JR Team Member",
    teamLeadEmail: "shaheer@gmail.com",
    hrEmail: "abdullah228@gmail.com",
    isActive: true,
  },
  {
    name: "Aelaf Ashraf",
    email: "aelaf@gmail.com",
    role: ROLE.TEAM_MEMBER,
    department: "Social Media",
    designation: "Management",
    teamLeadEmail: "neha75@gmail.com",
    hrEmail: "ahmad63@gmail.com",
    isActive: true,
  },
  {
    name: "Moatter Fatima",
    email: "moatter@gmail.com",
    role: ROLE.TEAM_MEMBER,
    department: "Social Media",
    designation: "Management Head",
    teamLeadEmail: "neha75@gmail.com",
    hrEmail: "ahmad63@gmail.com",
    isActive: true,
  },
  {
    name: "M Usman",
    email: "usman@gmail.com",
    role: ROLE.TEAM_MEMBER,
    department: "IT",
    designation: "JR Team Member",
    teamLeadEmail: "shaheer@gmail.com",
    hrEmail: "abdullah228@gmail.com",
    isActive: true,
  },
  {
    name: "M Arish",
    email: "arish@gmail.com",
    role: ROLE.TEAM_MEMBER,
    department: "Human Resources",
    designation: "Senior Team Member",
    teamLeadEmail: "neha75@gmail.com",
    hrEmail: "ahmad63@gmail.com",
    isActive: true,
  },
];

export const seedUsers = async (): Promise<void> => {
  await connectDB();
  logger.info("Starting database user seed...");

  const userMap = new Map<string, UserDocument>();

  // Pass 1: Upsert all users (creates documents so ObjectIds exist)
  for (const item of SEED_USERS) {
    const email = item.email.toLowerCase().trim();
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = new UserModel({
        name: item.name,
        email,
        password: DEFAULT_PASSWORD,
        role: item.role,
        department: item.department,
        designation: item.designation,
        phone: item.phone ?? "",
        isActive: item.isActive ?? true,
        hrId: null,
        teamLeadId: null,
        projectIds: [],
      });
      await user.save();
      logger.info({ email, role: item.role }, "Created new user");
    } else {
      user.name = item.name;
      user.role = item.role;
      user.department = item.department;
      user.designation = item.designation;
      user.password = DEFAULT_PASSWORD; // Update/reset password
      user.isActive = item.isActive ?? true;
      await user.save();
      logger.info({ email, role: item.role }, "Updated existing user");
    }

    userMap.set(email, user);
  }

  // Pass 2: Resolve and update organizational hierarchy (HR & Team Lead links)
  logger.info("Resolving organizational hierarchy links...");
  for (const item of SEED_USERS) {
    const email = item.email.toLowerCase().trim();
    const user = userMap.get(email);
    if (!user) continue;

    let hrId = null;
    let teamLeadId = null;

    if (item.hrEmail) {
      const hrUser = userMap.get(item.hrEmail.toLowerCase().trim());
      if (hrUser) {
        hrId = hrUser._id;
      }
    }

    if (item.teamLeadEmail) {
      const tlUser = userMap.get(item.teamLeadEmail.toLowerCase().trim());
      if (tlUser) {
        teamLeadId = tlUser._id;
        // If hrId was not explicitly set, inherit from Team Lead
        if (!hrId && tlUser.hrId) {
          hrId = tlUser.hrId;
        }
      }
    }

    user.hrId = hrId;
    user.teamLeadId = teamLeadId;
    await user.save();
  }

  logger.info(
    { count: SEED_USERS.length, defaultPassword: DEFAULT_PASSWORD },
    "User seed completed successfully!"
  );
};

// Direct script execution
seedUsers()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    logger.error({ err: error }, "User seed failed");
    await disconnectDB();
    process.exit(1);
  });
