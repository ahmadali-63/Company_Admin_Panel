import type { Types } from "mongoose";

import type { Filter } from "../../common/types/db.js";
import type { ResolvedPagination } from "../../common/utils/pagination.js";
import {
  NotificationModel,
  type NotificationAttrs,
  type NotificationDocument,
} from "./notification.model.js";

export const notificationRepository = {
  model: NotificationModel,

  create(data: Partial<NotificationAttrs>): Promise<NotificationDocument> {
    return NotificationModel.create(data);
  },

  findMany(
    filter: Filter<NotificationAttrs>,
    pagination?: ResolvedPagination,
  ) {
    let query = NotificationModel.find(filter).sort({ createdAt: -1 });

    if (pagination) {
      if (pagination.skip !== undefined) query = query.skip(pagination.skip);
      if (pagination.limit !== undefined) query = query.limit(pagination.limit);
    }

    return query.lean().exec();
  },

  count(filter: Filter<NotificationAttrs>): Promise<number> {
    return NotificationModel.countDocuments(filter).exec();
  },

  markAsRead(id: Types.ObjectId | string, userId: Types.ObjectId | string) {
    return NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true },
    ).exec();
  },

  markAllAsRead(userId: Types.ObjectId | string) {
    return NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    ).exec();
  },
};

export type NotificationRepository = typeof notificationRepository;
