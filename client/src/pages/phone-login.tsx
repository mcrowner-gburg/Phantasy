import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, MessageSquare } from "lucide-react";

export default function PhoneLogin() {
  const [, navigate] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestCodeMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/auth/request-phone-code", { phoneNumber });
      return await res.json();
    },
    onSuccess: () => {
      setCodeSent(true);
      toast({
        title: "Code sent!",
        description: "Check your phone for the verification code.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send code",
        description: error.message || "Could not send verification code",
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-phone-code", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    requestCodeMutation.mutate(phoneNumber);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast({
        title: "Verification code required",
        description: "Please enter the code sent to your phone",
        variant: "destructive",
      });
      return;
    }

    verifyCodeMutation.mutate({ phoneNumber, code: verificationCode });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Phone className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Phone Login</CardTitle>
          <CardDescription className="text-center">
            {!codeSent 
              ? "Enter your phone number to receive a verification code"
              : "Enter the verification code sent to your phone"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!codeSent ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
                <p className="text-xs text-gray-500">
                  This phone number must be registered with your account
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={requestCodeMutation.isPending}
              >
                {requestCodeMutation.isPending ? "Sending code..." : "Send verification code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500">
                  Code sent to {phoneNumber}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={verifyCodeMutation.isPending}
              >
                {verifyCodeMutation.isPending ? "Verifying..." : "Verify and login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCodeSent(false);
                  setVerificationCode("");
                }}
              >
                Back to phone number
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Or use{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                email login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}