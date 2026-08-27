import { z } from "zod";

export const createNotificationSchema = z.object({
  receiverId: z.string().min(1, "Receiver is required"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
});
