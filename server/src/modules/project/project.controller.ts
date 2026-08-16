import type { Response } from "express";

import { SUCCESS_MESSAGES } from "../../common/constants/messages.js";
import { validatedQuery } from "../../common/middleware/validate.js";
import type { IdParam } from "../../common/schemas/common.schema.js";
import type { AuthedRequest } from "../../common/types/http.js";
import { projectService, type AssignmentKind } from "./project.service.js";
import type {
  AssignHrInput,
  AssignMemberInput,
  AssignTeamLeadInput,
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from "./project.schema.js";

type AssignBody = AssignHrInput | AssignTeamLeadInput | AssignMemberInput;

const readAssigneeId = (kind: AssignmentKind, body: AssignBody): string => {
  switch (kind) {
    case "hr":
      return (body as AssignHrInput).hrId;
    case "teamLead":
      return (body as AssignTeamLeadInput).teamLeadId;
    default:
      return (body as AssignMemberInput).memberId;
  }
};

/** One handler pair per assignment kind, built from a shared implementation. */
const assignmentHandlers = (kind: AssignmentKind) => ({
  async assign(req: AuthedRequest<IdParam, unknown, AssignBody>, res: Response) {
    const { message, project } = await projectService.assign(
      kind,
      req.params.id,
      readAssigneeId(kind, req.body),
    );

    res.status(200).json({ success: true, message, project });
  },

  async unassign(
    req: AuthedRequest<IdParam, unknown, AssignBody>,
    res: Response,
  ) {
    const { message, project } = await projectService.unassign(
      kind,
      req.params.id,
      readAssigneeId(kind, req.body),
    );

    res.status(200).json({ success: true, message, project });
  },
});

export const projectController = {
  async create(
    req: AuthedRequest<Record<string, string>, unknown, CreateProjectInput>,
    res: Response,
  ) {
    const project = await projectService.create(req.user, req.body);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.PROJECT_CREATED,
      project,
    });
  },

  async list(req: AuthedRequest, res: Response) {
    const query = validatedQuery<ListProjectsQuery>(res);
    const { projects, pagination } = await projectService.list(req.user, query);

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
      pagination,
    });
  },

  async getById(req: AuthedRequest<IdParam>, res: Response) {
    const project = await projectService.getById(req.user, req.params.id);

    res.status(200).json({ success: true, project });
  },

  async update(
    req: AuthedRequest<IdParam, unknown, UpdateProjectInput>,
    res: Response,
  ) {
    const project = await projectService.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PROJECT_UPDATED,
      project,
    });
  },

  async remove(req: AuthedRequest<IdParam>, res: Response) {
    await projectService.remove(req.params.id);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PROJECT_DELETED,
    });
  },

  hr: assignmentHandlers("hr"),
  teamLead: assignmentHandlers("teamLead"),
  member: assignmentHandlers("member"),
};
