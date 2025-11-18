export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'fixed' | 'simple';
  area: number; // 0=todas, 1=PN, 2=PS
  actionType?: 'update_app' | 'link' | 'acknowledge';
  actionData?: string;
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601
  enabled: boolean;
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'fixed' | 'simple';
  area: number;
  actionType?: string;
  actionData?: string;
  startDate: string;
  endDate?: string;
  enabled: boolean;
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  type?: 'fixed' | 'simple';
  area?: number;
  actionType?: string;
  actionData?: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

export interface NotificationStats {
  notificationId: string;
  totalReads: number;
  totalActions: number;
  affectedUsers: number;
}

export interface PaginatedNotificationResponse {
  items: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

