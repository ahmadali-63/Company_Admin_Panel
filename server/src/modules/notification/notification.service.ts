import { Types } from "mongoose";
import { NotificationModel } from "./notification.model.js";

export class NotificationService {
  async createNotification(senderId: string, receiverId: string, title: string, message: string) {
    const notification = await NotificationModel.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      title,
      message,
    });
    
    return await notification.populate("senderId", "name email role");
  }

  async getMyNotifications(userId: string) {
    return await NotificationModel.find({ receiverId: new Types.ObjectId(userId) })
      .populate("senderId", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAsRead(notificationId: string, userId: string) {
    return await NotificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), receiverId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true }
    );
  }
}

export const notificationService = new NotificationService();
