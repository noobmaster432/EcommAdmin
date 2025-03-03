'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, ChevronDown, Store, Users, User, ShoppingCart, Bell, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usersApi } from '@/lib/api';

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/admin/login', '/admin/register', '/admin/verify-otp'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('adminToken');
    const userId = localStorage.getItem('userId');
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname || '');
    
    if (!token && !isPublicRoute) {
      router.push('/admin/login');
    } else if (token) {
      setIsAuthenticated(true);
      
      // Fetch user data if we have a userId
      if (userId) {
        fetchUserData(userId);
      }
    }
  }, [router, pathname]);

  const fetchUserData = async (userId: string) => {
    try {
      const userData = await usersApi.getById(userId);
      if (userData && userData.user) {
        setUserName(userData.user.fullName || 'Admin');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  // Don't render the admin layout for public routes
  if (PUBLIC_ROUTES.includes(pathname || '')) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex items-center flex-shrink-0">
                <Store className="w-8 h-8 text-primary" />
                <span className="ml-2 text-xl font-bold">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-4">
                    <span className="mr-2">{userName}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <nav className="flex flex-col h-full">
            <div className="flex-1 px-4 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/admin/dashboard')}
              >
                <Store className="w-5 h-5 mr-3" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/admin/products')}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Products
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/admin/users')}
              >
                <Users className="w-5 h-5 mr-3" />
                Users
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/admin/orders')}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Orders
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/admin/profile')}
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </Button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}