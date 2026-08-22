import type { Request, Response } from "express";

import { notificationService } from "./notification.service.js";
import type { ListNotificationsQuery } from "./notification.schema.js";

export const notificationController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await notificationService.list(
      req.user!,
      req.query as unknown as ListNotificationsQuery,
    );
    res.status(200).json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
      pagination: result.pagination,
    });
  },

  async markAsRead(req: Request, res: Response): Promise<void> {
    const result = await notificationService.markAsRead(
      req.user!,
      String(req.params.id),
    );
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  },

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    const result = await notificationService.markAllAsRead(req.user!);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
};
