import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from "../../common/constants/roles.js";

export interface NotificationAttrs {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = model<
  NotificationAttrs,
  NotificationModelType
>("Notification", notificationSchema);
