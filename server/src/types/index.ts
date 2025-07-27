import { Request, Response } from 'express';

// データベースの型定義
export interface User {
  id: string;
  family_id?: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  family_id: string;
  content?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: string;
  is_read: boolean;
  created_at: string;
}

// リクエストの型定義
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    familyId: string;
    email: string;
    role: string;
  };
}

// レスポンスの型定義
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
} 