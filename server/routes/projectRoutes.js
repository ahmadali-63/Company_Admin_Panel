const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  assignHR,
  removeHR,
  assignTeamLead,
  removeTeamLead,
  assignMember,
  removeMember,
  deleteProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("admin"), createProject);

router.get("/", protect, authorizeRoles("admin", "hr", "team_lead", "team_member"), getProjects);

router.get("/:id", protect, authorizeRoles("admin", "hr", "team_lead", "team_member"), getProjectById);

router.put("/:id", protect, authorizeRoles("admin"), updateProject);

// HR assignments
router.post("/:id/hr", protect, authorizeRoles("admin"), assignHR);
router.delete("/:id/hr", protect, authorizeRoles("admin"), removeHR);

// Team Lead assignments
router.post("/:id/team-leads", protect, authorizeRoles("admin", "hr"), assignTeamLead);
router.delete("/:id/team-leads", protect, authorizeRoles("admin", "hr"), removeTeamLead);

// Team Member assignments
router.post("/:id/members", protect, authorizeRoles("admin", "hr", "team_lead"), assignMember);
router.delete("/:id/members", protect, authorizeRoles("admin", "hr", "team_lead"), removeMember);

router.delete("/:id", protect, authorizeRoles("admin"), deleteProject);
// this will export the modules now
module.exports = router;
// this is the ending point of the routing code for the project routes.