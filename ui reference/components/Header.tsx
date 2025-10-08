import React from "react";
import { View, User } from "../types";
import { TextLogo } from "./Icons";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
  activeView?: View;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  user,
  onLogout,
  activeView
}) => {
  const handleNavClick = (
    e: React.MouseEvent,
    view: View,
    context?: string
  ) => {
    e.preventDefault();
    onNavigate(view, context);
  };

  const handleInternalLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchorId: string
  ) => {
    e.preventDefault();
    onNavigate(View.Landing, anchorId);
  };

  return (
    <header className="py-6 flex justify-between items-center sticky top-0 backdrop-blur-sm z-50 -mx-6 md:-mx-12 px-6 md:px-12">
      <a
        href="#"
        onClick={(e) => handleNavClick(e, View.Landing)}
        className="flex items-center gap-3"
      >
        <TextLogo height={28} />
      </a>
      <nav className="hidden md:flex items-center gap-8 font-medium text-[#555555]">
        <a
          href="#community"
          onClick={(e) => handleInternalLinkClick(e, "community")}
          className="hover:text-[#212121] transition-colors"
        >
          Discover
        </a>
        <a
          href="#"
          onClick={(e) => handleNavClick(e, View.Pricing)}
          className={`hover:text-[#212121] transition-colors ${activeView === View.Pricing ? "text-[#212121] font-semibold" : ""}`}
        >
          Pricing
        </a>
        <a
          href="#"
          onClick={(e) => handleNavClick(e, View.Docs)}
          className={`hover:text-[#212121] transition-colors ${activeView === View.Docs ? "text-[#212121] font-semibold" : ""}`}
        >
          Learn
        </a>
      </nav>
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <UserMenu user={user} onNavigate={onNavigate} onLogout={onLogout} />
        ) : (
          <>
            <a
              href="#"
              onClick={(e) => handleNavClick(e, View.Login)}
              className="font-medium text-[#555555] hover:text-[#212121] transition-colors"
            >
              Log In
            </a>
            <a
              href="#"
              onClick={(e) => handleNavClick(e, View.SignUp)}
              className="bg-[#212121] text-white font-semibold py-2 px-5 rounded-lg hover:bg-[#333333] transition-colors"
            >
              Sign Up
            </a>
          </>
        )}
      </div>
    </header>
  );
};
