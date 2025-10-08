import React, { useState } from "react";
import { View } from "../types";
import { TextLogo } from "./Icons";

interface LoginPageProps {
  onLogin: (email: string) => void;
  onNavigate: (view: View, context?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate here
    if (email && password) {
      onLogin(email);
    }
  };

  const handleNavClick = (e: React.MouseEvent, view: View) => {
    e.preventDefault();
    onNavigate(view);
  };

  return (
    <div className="text-[#212121] min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C87550] opacity-30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#5E837D] opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <a
        href="#"
        onClick={(e) => handleNavClick(e, View.Landing)}
        className="flex items-center gap-3 mb-8"
      >
        <TextLogo height={28} />
      </a>

      <div className="w-full max-w-md bg-white/60 backdrop-blur-sm border border-[#E0E0E0] rounded-2xl shadow-lg shadow-black/10 p-8">
        <h1 className="text-3xl font-bold text-center text-[#212121]">
          Welcome Back
        </h1>
        <p className="text-center text-[#555555] mt-2">
          Log in to continue to your workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#555555]"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white border border-[#D0D0D0] rounded-lg shadow-sm placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#C87550]/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#555555]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white border border-[#D0D0D0] rounded-lg shadow-sm placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#C87550]/50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#212121] text-white font-semibold rounded-lg hover:bg-[#333333] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#212121]"
          >
            Log In
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#555555]">
          Don't have an account?{" "}
          <a
            href="#"
            onClick={(e) => handleNavClick(e, View.SignUp)}
            className="font-medium text-[#C87550] hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
