export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  appId?: string;
  area?: number;
  enabled?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: IUser;
  token: string;
}

export interface UserStats {
  user: {
    name: string;
    email: string;
    appId: string;
    createdAt: string;
    lastLogin: string;
  };
  systemInfo: {
    totalTopics: number;
    enabledTopics: number;
    disabledTopics: number;
  };
}
