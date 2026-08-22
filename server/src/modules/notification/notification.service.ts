import type { Types } from "mongoose";

import {
  buildPaginationMeta,
  resolvePagination,
} from "../../common/utils/pagination.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import type { Filter } from "../../common/types/db.js";
import {
  NotificationModel,
  type NotificationAttrs,
} from "./notification.model.js";
import { notificationRepository } from "./notification.repository.js";
import type { ListNotificationsQuery } from "./notification.schema.js";

export const notificationService = {
  async list(actor: AuthenticatedUser, query: ListNotificationsQuery) {
    const filter: Filter<NotificationAttrs> = {
      userId: actor._id as unknown as Types.ObjectId,
    };

    if (query.unreadOnly === "true") {
      filter.isRead = false;
    }

    const pagination = resolvePagination(query);

    const [notifications, total, unreadCount] = await Promise.all([
      notificationRepository.findMany(filter, pagination),
      notificationRepository.count(filter),
      notificationRepository.count({
        userId: actor._id as unknown as Types.ObjectId,
        isRead: false,
      } as Filter<NotificationAttrs>),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: buildPaginationMeta(total, pagination),
    };
  },

  async markAsRead(actor: AuthenticatedUser, notificationId: string) {
    const updated = await notificationRepository.markAsRead(
      notificationId,
      actor._id,
    );
    return updated;
  },

  async markAllAsRead(actor: AuthenticatedUser) {
    await notificationRepository.markAllAsRead(actor._id);
    return { success: true, message: "All notifications marked as read." };
  },
};
