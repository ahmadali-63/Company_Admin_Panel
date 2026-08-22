import { connectDB, disconnectDB } from "../config/db.js";
import { logger } from "../config/logger.js";
import { ROLE } from "../common/constants/roles.js";
import { UserModel } from "../modules/user/user.model.js";
import { ProjectModel } from "../modules/project/project.model.js";
import { TaskModel } from "../modules/task/task.model.js";
import { AttendanceModel } from "../modules/attendance/attendance.model.js";
import { getTodayDateString } from "../modules/attendance/attendance.service.js";
import { LeaveModel } from "../modules/leave/leave.model.js";
import { NotificationModel } from "../modules/notification/notification.model.js";

export const seedDatabase = async (): Promise<void> => {
  await connectDB();

  logger.info("Checking database state...");
  const adminExists = await UserModel.findOne({ role: ROLE.ADMIN });

  if (adminExists) {
    logger.info("Admin already exists. Cleaning up other collections for fresh seed if needed or continuing...");
  }

  // Clear existing collections for a clean, consistent full seed
  await Promise.all([
    UserModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    TaskModel.deleteMany({}),
    AttendanceModel.deleteMany({}),
    LeaveModel.deleteMany({}),
    NotificationModel.deleteMany({}),
  ]);

  logger.info("Creating Users...");

  // 1. Admin
  const admin = await UserModel.create({
    employeeId: "ADM-001",
    name: "System Administrator",
    email: "admin@company.com",
    password: "Admin@12345",
    role: ROLE.ADMIN,
    phone: "+1 (555) 019-2831",
    department: "Executive Management",
    designation: "Managing Director",
    hrId: null,
    projectIds: [],
    isActive: true,
    joiningDate: new Date("2024-01-01"),
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  });

  // 2. HR Users
  const hr1 = await UserModel.create({
    employeeId: "HR-001",
    name: "Sarah Jenkins",
    email: "sarah.hr@company.com",
    password: "Admin@12345",
    role: ROLE.HR,
    phone: "+1 (555) 014-9281",
    department: "Human Resources",
    designation: "Head of People & Talent",
    hrId: null,
    projectIds: [],
    isActive: true,
    joiningDate: new Date("2024-03-15"),
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  });

  const hr2 = await UserModel.create({
    employeeId: "HR-002",
    name: "Michael Scott",
    email: "michael.hr@company.com",
    password: "Admin@12345",
    role: ROLE.HR,
    phone: "+1 (555) 018-4729",
    department: "Human Resources",
    designation: "HR Operations Lead",
    hrId: null,
    projectIds: [],
    isActive: true,
    joiningDate: new Date("2024-06-01"),
    profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
  });

  // 3. Employee Users
  const emp1 = await UserModel.create({
    employeeId: "EMP-101",
    name: "Ahmad Ali",
    email: "ahmad.ali@company.com",
    password: "Admin@12345",
    role: ROLE.EMPLOYEE,
    phone: "+1 (555) 012-3456",
    department: "Engineering",
    designation: "Senior Frontend Engineer",
    hrId: hr1._id,
    projectIds: [],
    isActive: true,
    joiningDate: new Date("2024-07-10"),
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  });

  const emp2 = await UserModel.create({
    employeeId: "EMP-102",
    name: "Elena Rostova",
    email: "elena.rostova@company.com",
    password: "Admin@12345",
    role: ROLE.EMPLOYEE,
    phone: "+1 (555) 019-8765",
    department: "Engineering",
    designation: "Senior Backend Engineer",
    hrId: hr1._id,
    projectIds: [],
    isActive: true,
    joiningDate: new Date("2024-08-01"),
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  });

  const emp3 = await UserModel.create({
    employeeId: "EMP-103",
    name: "David Kim",
    email: "david.kim@company.com",
    password: "Admin@12345",
    role: ROLE.EMPLOYEE,
    phone: "+1 (555) 017-5544",
    department: "Design",
    designation: "UI/UX Product Designer",
    hrId: hr1._id,
    projectIds: [],
    isActive: true,
    joiningDate: new Date("2024-09-15"),
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  });

  const emp4 = await UserModel.create({
    employeeId: "EMP-104",
    name: "Sophia Chen",
    email: "sophia.chen@company.com",
    password: "Admin@12345",
    role: ROLE.EMPLOYEE,
    phone: "+1 (555) 013-9988",
    department: "Quality Assurance",
    designation: "Lead QA Automation Engineer",
    hrId: hr2._id,
    projectIds: [],
    isActive: true,
    joiningDate: new Date("2024-10-01"),
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  });

  const emp5 = await UserModel.create({
    employeeId: "EMP-105",
    name: "Marcus Vance",
    email: "marcus.vance@company.com",
    password: "Admin@12345",
    role: ROLE.EMPLOYEE,
    phone: "+1 (555) 016-7722",
    department: "DevOps",
    designation: "Cloud Infrastructure Engineer",
    hrId: hr2._id,
    projectIds: [],
    isActive: true,
    joiningDate: new Date("2024-11-01"),
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  });

  logger.info("Creating Projects...");

  // 4. Projects
  const proj1 = await ProjectModel.create({
    name: "Enterprise ERP System",
    code: "ERP-2026",
    description: "Next-generation enterprise management platform with real-time analytics and modular workflows.",
    status: "active",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    createdBy: admin._id,
    hrIds: [hr1._id],
    employeeIds: [emp1._id, emp2._id, emp3._id],
    memberIds: [emp1._id, emp2._id, emp3._id],
    isActive: true,
  });

  const proj2 = await ProjectModel.create({
    name: "Cloud Infrastructure 2.0",
    code: "CLD-2026",
    description: "Multi-cloud architecture migration, Kubernetes cluster rollout, and zero-trust security implementation.",
    status: "active",
    startDate: new Date("2026-02-15"),
    endDate: new Date("2026-10-30"),
    createdBy: admin._id,
    hrIds: [hr2._id],
    employeeIds: [emp4._id, emp5._id],
    memberIds: [emp4._id, emp5._id],
    isActive: true,
  });

  const proj3 = await ProjectModel.create({
    name: "Mobile Banking App v3",
    code: "MOB-2026",
    description: "Biometric authentication, instant transfers, and personal finance dashboard for iOS and Android.",
    status: "planning",
    startDate: new Date("2026-09-01"),
    endDate: new Date("2027-03-31"),
    createdBy: admin._id,
    hrIds: [hr1._id],
    employeeIds: [emp1._id, emp3._id],
    memberIds: [emp1._id, emp3._id],
    isActive: true,
  });

  // Link projects to users
  await UserModel.updateOne({ _id: emp1._id }, { $set: { projectIds: [proj1._id, proj3._id] } });
  await UserModel.updateOne({ _id: emp2._id }, { $set: { projectIds: [proj1._id] } });
  await UserModel.updateOne({ _id: emp3._id }, { $set: { projectIds: [proj1._id, proj3._id] } });
  await UserModel.updateOne({ _id: emp4._id }, { $set: { projectIds: [proj2._id] } });
  await UserModel.updateOne({ _id: emp5._id }, { $set: { projectIds: [proj2._id] } });
  await UserModel.updateOne({ _id: hr1._id }, { $set: { projectIds: [proj1._id, proj3._id] } });
  await UserModel.updateOne({ _id: hr2._id }, { $set: { projectIds: [proj2._id] } });

  logger.info("Creating Tasks...");

  // 5. Tasks
  const todayDate = new Date();
  const pastDate = new Date(todayDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  const futureDate1 = new Date(todayDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  await TaskModel.create([
    {
      title: "Design Responsive Dashboard Wireframes",
      description: "Create pixel-perfect Figma layouts and design tokens for the company administration panel.",
      projectId: proj1._id,
      assignedTo: emp3._id,
      assignedBy: hr1._id,
      createdBy: hr1._id,
      priority: "high",
      status: "completed",
      deadline: pastDate,
      dueDate: pastDate,
      completedAt: pastDate,
      comments: [
        {
          text: "Wireframes approved by management.",
          author: hr1._id,
          createdAt: pastDate,
        },
      ],
    },
    {
      title: "Implement Role-Based JWT Authentication",
      description: "Build robust backend middleware for token verification, cookie rotation, and RBAC authorization.",
      projectId: proj1._id,
      assignedTo: emp2._id,
      assignedBy: hr1._id,
      createdBy: hr1._id,
      priority: "urgent",
      status: "in_progress",
      deadline: futureDate1,
      dueDate: futureDate1,
      comments: [
        {
          text: "Integrated bcrypt and auth routes, writing test suite now.",
          author: emp2._id,
          createdAt: new Date(),
        },
      ],
    },
    {
      title: "Build Employee Attendance Live Clock Interface",
      description: "Develop the frontend widget with real-time status, daily check-in / check-out actions, and working hour counter.",
      projectId: proj1._id,
      assignedTo: emp1._id,
      assignedBy: hr1._id,
      createdBy: hr1._id,
      priority: "high",
      status: "in_progress",
      deadline: futureDate1,
      dueDate: futureDate1,
      comments: [],
    },
    {
      title: "Configure CI/CD Pipelines & Docker Multi-Stage Builds",
      description: "Automate build and deployment pipelines with GitHub Actions and Docker containers.",
      projectId: proj2._id,
      assignedTo: emp5._id,
      assignedBy: hr2._id,
      createdBy: hr2._id,
      priority: "medium",
      status: "pending",
      deadline: futureDate2,
      dueDate: futureDate2,
      comments: [],
    },
    {
      title: "Automate E2E Regression Test Suite",
      description: "Write automated Cypress/Playwright test suites for leave approval and task workflow.",
      projectId: proj2._id,
      assignedTo: emp4._id,
      assignedBy: hr2._id,
      createdBy: hr2._id,
      priority: "medium",
      status: "overdue",
      deadline: pastDate,
      dueDate: pastDate,
      comments: [
        {
          text: "Blocked by staging environment upgrade.",
          author: emp4._id,
          createdAt: pastDate,
        },
      ],
    },
    {
      title: "Security Audit and Penetration Testing",
      description: "Perform OWASP Top 10 security verification on API endpoints and rate limiters.",
      projectId: proj2._id,
      assignedTo: emp5._id,
      assignedBy: hr2._id,
      createdBy: hr2._id,
      priority: "urgent",
      status: "pending",
      deadline: futureDate2,
      dueDate: futureDate2,
      comments: [],
    },
  ]);

  logger.info("Creating Attendance records...");

  // 6. Attendance records
  const todayStr = getTodayDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayStr = getTodayDateString(yesterday);

  // Today attendance for HR1 (present, checked in early)
  const hr1CheckIn = new Date();
  hr1CheckIn.setHours(8, 45, 0, 0);
  await AttendanceModel.create({
    userId: hr1._id,
    date: todayStr,
    checkIn: hr1CheckIn,
    checkOut: null,
    workingHours: "",
    workingMinutes: 0,
    status: "Present",
    notes: "Regular morning check-in",
  });

  // Today attendance for Emp1 (Ahmad Ali - Checked in at 8:55 AM)
  const emp1CheckIn = new Date();
  emp1CheckIn.setHours(8, 55, 0, 0);
  await AttendanceModel.create({
    userId: emp1._id,
    date: todayStr,
    checkIn: emp1CheckIn,
    checkOut: null,
    workingHours: "",
    workingMinutes: 0,
    status: "Present",
    notes: "On-time arrival",
  });

  // Today attendance for Emp2 (Elena Rostova - Checked in 9:25 AM Late)
  const emp2CheckIn = new Date();
  emp2CheckIn.setHours(9, 25, 0, 0);
  await AttendanceModel.create({
    userId: emp2._id,
    date: todayStr,
    checkIn: emp2CheckIn,
    checkOut: null,
    workingHours: "",
    workingMinutes: 0,
    status: "Late",
    notes: "Traffic delay on highway",
  });

  // Yesterday complete attendance for Emp1
  const yCheckIn = new Date(yesterday);
  yCheckIn.setHours(9, 0, 0, 0);
  const yCheckOut = new Date(yesterday);
  yCheckOut.setHours(17, 15, 0, 0);
  await AttendanceModel.create({
    userId: emp1._id,
    date: yesterdayStr,
    checkIn: yCheckIn,
    checkOut: yCheckOut,
    workingHours: "8h 15m",
    workingMinutes: 495,
    status: "Checked Out",
    notes: "",
  });

  // Yesterday complete attendance for Emp2
  await AttendanceModel.create({
    userId: emp2._id,
    date: yesterdayStr,
    checkIn: yCheckIn,
    checkOut: yCheckOut,
    workingHours: "8h 15m",
    workingMinutes: 495,
    status: "Checked Out",
    notes: "",
  });

  logger.info("Creating Leaves...");

  // 7. Leave records
  const leaveStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const leaveEnd = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

  // Pending leave application from Ahmad Ali
  await LeaveModel.create({
    userId: emp1._id,
    leaveType: "casual",
    startDate: leaveStart,
    endDate: leaveEnd,
    reason: "Attending family function out of town.",
    status: "pending",
    approvedBy: null,
    approvedAt: null,
    responseComment: "",
  });

  // Approved leave for Elena Rostova
  await LeaveModel.create({
    userId: emp2._id,
    leaveType: "sick",
    startDate: pastDate,
    endDate: pastDate,
    reason: "Dental appointment and recovery.",
    status: "approved",
    approvedBy: hr1._id,
    approvedAt: pastDate,
    responseComment: "Approved. Take care.",
  });

  // Rejected leave for Sophia Chen
  await LeaveModel.create({
    userId: emp4._id,
    leaveType: "annual",
    startDate: leaveStart,
    endDate: leaveEnd,
    reason: "Personal vacation trip.",
    status: "rejected",
    approvedBy: hr2._id,
    approvedAt: new Date(),
    responseComment: "Project sprint deadline week. Please reschedule.",
  });

  logger.info("Creating Notifications...");

  // 8. Notifications
  await NotificationModel.create([
    {
      userId: admin._id,
      title: "System Initialization Complete",
      message: "Company Management & Admin Panel is active with 1 Admin, 2 HRs, and 5 Employees.",
      type: "system",
      isRead: false,
    },
    {
      userId: hr1._id,
      title: "New Leave Application",
      message: "Ahmad Ali (EMP-101) has applied for casual leave.",
      type: "leave",
      isRead: false,
    },
    {
      userId: emp1._id,
      title: "Welcome to Company Portal",
      message: "Your employee account EMP-101 has been activated. Please check your assigned tasks.",
      type: "system",
      isRead: false,
    },
    {
      userId: emp1._id,
      title: "New Task Assigned",
      message: "Sarah Jenkins assigned you: 'Build Employee Attendance Live Clock Interface'. Priority: HIGH",
      type: "task",
      isRead: false,
    },
    {
      userId: emp2._id,
      title: "Leave Approved",
      message: "Your sick leave request for yesterday was approved by Sarah Jenkins.",
      type: "leave",
      isRead: true,
    },
  ]);

  logger.info("==================================================");
  logger.info("SEED COMPLETED SUCCESSFULLY!");
  logger.info("Credentials for testing:");
  logger.info("ADMIN:    admin@company.com          / Admin@12345");
  logger.info("HR 1:     sarah.hr@company.com       / Admin@12345");
  logger.info("HR 2:     michael.hr@company.com     / Admin@12345");
  logger.info("EMPLOYEE: ahmad.ali@company.com      / Admin@12345");
  logger.info("EMPLOYEE: elena.rostova@company.com  / Admin@12345");
  logger.info("==================================================");
};

// Run directly if invoked as script
if (process.argv[1]?.includes("seedAll") || process.argv[1]?.includes("seedAdmin")) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (error) => {
      logger.error({ err: error }, "Seed script failed");
      await disconnectDB();
      process.exit(1);
    });
}
