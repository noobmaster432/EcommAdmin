'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      router.push('/admin/login');
      toast.error('Please login first');
      return;
    }
    setEmail(storedEmail);

    // Set up countdown timer
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await authApi.verifyOtp({ email, otp });
      
      // Store token
      localStorage.setItem('adminToken', data.token);
      
      // Redirect to dashboard
      router.push('/admin/dashboard');
      toast.success('Account verified successfully');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      await authApi.resendOtp({ email });
      setCountdown(60);
      toast.success('OTP resent successfully');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Store className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Verify Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">
                We've sent a verification code to <span className="font-medium">{email}</span>
              </p>
            </div>
            
            <div className="flex justify-center py-2">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={setOtp}
                disabled={isLoading}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={countdown > 0 || isResending}
                onClick={handleResendOTP}
                className="text-xs"
              >
                {isResending ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  'Resend OTP'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm"
              onClick={() => router.push('/admin/login')}
            >
              Back to Login
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}