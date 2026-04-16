import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const inputStyle: React.CSSProperties = {
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
};

const labelStyle: React.CSSProperties = {
  color: "#d1d5db",
  fontSize: "0.875rem",
  fontWeight: 500,
};

export default function Register() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; phoneNumber?: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome to Phantasy!", description: "Your account has been created successfully." });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message || "Failed to create account", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast({ title: "Missing information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Password mismatch", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters long", variant: "destructive" });
      return;
    }

    registerMutation.mutate({ username, email, phoneNumber: phoneNumber || undefined, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: "#030712" }}>
      <div
        className="w-full max-w-md rounded-xl p-8 space-y-6"
        style={{ backgroundColor: "#111827", border: "1px solid #374151" }}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "#ffffff" }}>Join Phantasy</h1>
          <p style={{ color: "#9ca3af" }}>Create your account to start drafting songs</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" style={labelStyle}>Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" style={labelStyle}>
              Phone Number <span style={{ color: "#6b7280", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              style={inputStyle}
            />
            <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>For SMS notifications and invite links</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 6 characters)"
              required
              style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            style={{
              display: "block",
              width: "100%",
              padding: "0.625rem 1rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: registerMutation.isPending ? "#1d4ed8" : "#2563eb",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: registerMutation.isPending ? "not-allowed" : "pointer",
              opacity: registerMutation.isPending ? 0.7 : 1,
            }}
          >
            {registerMutation.isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center" style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#60a5fa" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
