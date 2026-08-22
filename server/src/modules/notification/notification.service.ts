import { Types } from "mongoose";
import { NotificationModel } from "./notification.model.js";
import { NotFoundError } from "../../common/errors/AppError.js";

export class NotificationService {
  async create(
    userId: string | Types.ObjectId,
    data: { title: string; message: string; type: string }
  ) {
    return NotificationModel.create({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
    });
  }

  async list(userId: string | Types.ObjectId) {
    return NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async markAsRead(userId: string | Types.ObjectId, id: string | Types.ObjectId) {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true }
    ).exec();

    if (!notification) {
      throw new NotFoundError("Notification not found.");
    }

    return notification;
  }

  async markAllAsRead(userId: string | Types.ObjectId) {
    await NotificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    ).exec();
  }
}

export const notificationService = new NotificationService();
