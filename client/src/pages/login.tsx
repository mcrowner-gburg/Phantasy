import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, navigate] = useLocation();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { usernameOrEmail: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both username/email and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ usernameOrEmail, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#030712" }}>
      <div
        className="w-full max-w-md rounded-xl p-8 space-y-6"
        style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "#ffffff" }}>Welcome back</h1>
          <p style={{ color: "#9ca3af" }}>Sign in to your Phantasy account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="usernameOrEmail" style={{ color: "#d1d5db", fontSize: "0.875rem", fontWeight: 500 }}>
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your username or email"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                backgroundColor: "#1f2937",
                color: "#ffffff",
                fontSize: "0.875rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" style={{ color: "#d1d5db", fontSize: "0.875rem", fontWeight: 500 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                backgroundColor: "#1f2937",
                color: "#ffffff",
                fontSize: "0.875rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              display: "block",
              width: "100%",
              padding: "0.625rem 1rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: loginMutation.isPending ? "#1d4ed8" : "#2563eb",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: loginMutation.isPending ? "not-allowed" : "pointer",
              opacity: loginMutation.isPending ? 0.7 : 1,
            }}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer links */}
        <div className="space-y-2 text-center">
          <div>
            <Link href="/forgot-password" style={{ color: "#60a5fa", fontSize: "0.875rem" }}>
              Forgot your password?
            </Link>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "#60a5fa" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
