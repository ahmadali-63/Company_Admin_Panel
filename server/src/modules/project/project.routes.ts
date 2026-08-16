import { Router } from "express";

import { ROLE } from "../../common/constants/roles.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import { idParamSchema } from "../../common/schemas/common.schema.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { projectController } from "./project.controller.js";
import {
  assignHrSchema,
  assignMemberSchema,
  assignTeamLeadSchema,
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from "./project.schema.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(ROLE.ADMIN),
  validate({ body: createProjectSchema }),
  asyncHandler(projectController.create),
);

router.get(
  "/",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD, ROLE.TEAM_MEMBER),
  validate({ query: listProjectsQuerySchema }),
  asyncHandler(projectController.list),
);

router.get(
  "/:id",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD, ROLE.TEAM_MEMBER),
  validate({ params: idParamSchema }),
  asyncHandler(projectController.getById),
);

router.put(
  "/:id",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema, body: updateProjectSchema }),
  asyncHandler(projectController.update),
);

// HR assignments
router.post(
  "/:id/hr",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema, body: assignHrSchema }),
  asyncHandler(projectController.hr.assign),
);
router.delete(
  "/:id/hr",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema, body: assignHrSchema }),
  asyncHandler(projectController.hr.unassign),
);

// Team Lead assignments
router.post(
  "/:id/team-leads",
  authorize(ROLE.ADMIN, ROLE.HR),
  validate({ params: idParamSchema, body: assignTeamLeadSchema }),
  asyncHandler(projectController.teamLead.assign),
);
router.delete(
  "/:id/team-leads",
  authorize(ROLE.ADMIN, ROLE.HR),
  validate({ params: idParamSchema, body: assignTeamLeadSchema }),
  asyncHandler(projectController.teamLead.unassign),
);

// Team Member assignments
router.post(
  "/:id/members",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD),
  validate({ params: idParamSchema, body: assignMemberSchema }),
  asyncHandler(projectController.member.assign),
);
router.delete(
  "/:id/members",
  authorize(ROLE.ADMIN, ROLE.HR, ROLE.TEAM_LEAD),
  validate({ params: idParamSchema, body: assignMemberSchema }),
  asyncHandler(projectController.member.unassign),
);

router.delete(
  "/:id",
  authorize(ROLE.ADMIN),
  validate({ params: idParamSchema }),
  asyncHandler(projectController.remove),
);

export const projectRoutes = router;
