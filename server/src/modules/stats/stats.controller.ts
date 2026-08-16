import type { Response } from "express";

import type { AuthedRequest } from "../../common/types/http.js";
import { statsService } from "./stats.service.js";

export const statsController = {
  async dashboard(req: AuthedRequest, res: Response) {
    const payload = await statsService.dashboard(req.user);

    res.status(200).json({ success: true, ...payload });
  },
};
