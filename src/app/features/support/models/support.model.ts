export interface SupportMessage {
  id: string;
  sender: 'user' | 'admin' | string;
  senderId?: string;
  senderName?: string;
  message: string;
  createdAt: string;
}

export interface SupportConversation {
  id: string;
  userId?: string;
  userEmail?: string;
  title: string;
  status: 'open' | 'closed' | string;
  messages: SupportMessage[];
  lastUpdated: string;
  unreadByAdmin?: boolean;
  unreadByUser?: boolean;
  messageCount?: number;
  area?: number;
}

