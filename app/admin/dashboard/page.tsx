'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { UserType, OrderType, ProductType } from '@/app/types';
import { usersApi, ordersApi, productsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data with error handling for each API call
        let users: UserType[] = [];
        let orders: OrderType[] = [];
        let products: ProductType[] = [];
        
        try {
          const userData = await usersApi.getAll();
          users = Array.isArray(userData.users) ? userData.users : [];
        } catch (error) {
          console.error('Error fetching users:', error);
          users = [];
        }
        
        try {
          const ordersData = await ordersApi.getAll();
          orders = Array.isArray(ordersData.allOrders) ? ordersData.allOrders : [];
        } catch (error) {
          console.error('Error fetching orders:', error);
          orders = [];
        }
        
        try {
          const productsData = await productsApi.getAll();
          products = Array.isArray(productsData.products) ? productsData.products : [];
        } catch (error) {
          console.error('Error fetching products:', error);
          products = [];
        }

        // Calculate revenue safely
        const revenue = orders.reduce((acc: number, order: OrderType) => {
          return acc + (typeof order.totalPrice === 'number' && order.status !== "Cancelled" ? order.totalPrice : 0);
        }, 0);

        setStats({
          totalUsers: users.length,
          totalOrders: orders.length,
          totalRevenue: revenue,
          totalProducts: products.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Error loading dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `$${stats.totalRevenue.toFixed(2)}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalProducts}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}