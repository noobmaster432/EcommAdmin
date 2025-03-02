'use client';

export interface ProductType {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: Category;
  rating: number;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface CategoryType {
  id: number;
  name: string;
  image: string;
}

export interface CartItemType {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface NotificationType {
  id: number;
  title: string;
  message: string;
  timestamp: string;
}

export interface UserType {
  id: number;
  email: string;
  fullName: string;
}

export interface OrderType {
  id: number;
  userId: number;
  items: CartItemType[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface AuthResponseType {
  token: string;
  user: UserType;
}

export interface OtpVerificationResponseType {
  token: string;
  message: string;
}