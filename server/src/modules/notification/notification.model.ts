import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

export interface NotificationAttrs {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationDocument = HydratedDocument<NotificationAttrs>;
export type NotificationModelType = Model<NotificationAttrs>;

const notificationSchema = new Schema<NotificationAttrs, NotificationModelType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const NotificationModel = model<NotificationAttrs, NotificationModelType>(
  "Notification",
  notificationSchema
);
