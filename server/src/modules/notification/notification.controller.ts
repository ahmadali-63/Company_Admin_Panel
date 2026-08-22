import type { Request, Response } from "express";
import { notificationService } from "./notification.service.js";

export class NotificationController {
  async list(req: Request, res: Response) {
    const userId = req.user!._id;
    const notifications = await notificationService.list(userId);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  }

  async markAsRead(req: Request, res: Response) {
    const userId = req.user!._id;
    const { id } = req.params;

    if (id === "all") {
      await notificationService.markAllAsRead(userId);
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
      return;
    }

    const notification = await notificationService.markAsRead(userId, id!);
    res.status(200).json({
      success: true,
      data: notification,
    });
  }
}

export const notificationController = new NotificationController();
