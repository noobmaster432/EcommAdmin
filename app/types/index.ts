'use client';

export interface ProductType {
  _id: string;
  name: string;
  price: number;
  description?: string;
  photo?: string;
  category: string;
  rating?: number;
  stock?: number;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
}

export interface CategoryType {
  _id: string;
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
  _id: string;
  email: string;
  fullName: string;
}

export interface OrderType {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  items: CartItemType[];
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  createdAt: string;
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface AuthResponseType {
  token: string;
  user: UserType;
}

export interface OtpVerificationResponseType {
  token: string;
  message: string;
}