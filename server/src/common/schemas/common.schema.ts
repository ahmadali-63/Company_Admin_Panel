import { Types } from "mongoose";
import { z } from "zod";

export const objectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: "must be a valid ID",
  });

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const booleanQuerySchema = z
  .union([z.literal("true"), z.literal("false"), z.boolean()])
  .transform((value) => value === true || value === "true");

export const trimmedString = (max: number) => z.string().trim().max(max);

export const optionalDate = z
  .union([z.coerce.date(), z.literal(""), z.null()])
  .transform((value) => (value === "" || value === null ? null : value))
  .optional();
