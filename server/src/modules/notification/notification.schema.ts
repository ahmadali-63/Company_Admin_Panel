import { z } from "zod";

import { paginationQuerySchema } from "../../common/schemas/common.schema.js";

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  unreadOnly: z.enum(["true", "false"]).optional(),
});

export type ListNotificationsQuery = z.infer<
  typeof listNotificationsQuerySchema
>;
