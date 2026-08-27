import { Schema, model, type HydratedDocument, type Model, Types } from "mongoose";

export interface NotificationAttrs {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  title: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationDocument = HydratedDocument<NotificationAttrs>;
export type NotificationModelType = Model<NotificationAttrs>;

const notificationSchema = new Schema<NotificationAttrs, NotificationModelType>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = model<NotificationAttrs, NotificationModelType>(
  "Notification",
  notificationSchema
);
