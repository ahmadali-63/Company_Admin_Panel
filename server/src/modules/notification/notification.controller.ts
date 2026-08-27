import { type Request, type Response } from "express";
import { notificationService } from "./notification.service.js";
import { getSocketIo } from "../../common/utils/socket.js";

export class NotificationController {
  async createNotification(req: Request, res: Response) {
    const { receiverId, title, message } = req.body;
    const senderId = req.user!._id.toString();

    const notification = await notificationService.createNotification(
      senderId,
      receiverId,
      title,
      message
    );

    // Emit socket event to the receiver
    const io = getSocketIo();
    io.to(receiverId).emit("receive_notification", notification);

    res.status(201).json({ message: "Notification sent", notification });
  }

  async getMyNotifications(req: Request, res: Response) {
    const userId = req.user!._id.toString();
    const notifications = await notificationService.getMyNotifications(userId);
    res.status(200).json(notifications);
  }

  async markAsRead(req: Request, res: Response) {
    const notificationId = req.params.id as string;
    const userId = req.user!._id.toString();
    
    const notification = await notificationService.markAsRead(notificationId, userId);
    res.status(200).json({ message: "Marked as read", notification });
  }
}

export const notificationController = new NotificationController();
