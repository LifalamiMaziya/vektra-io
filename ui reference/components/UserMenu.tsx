import React, { useState, useEffect, useRef } from "react";
import { View, User } from "../types";

interface UserMenuProps {
  user: User;
  onNavigate: (view: View, context?: string) => void;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onNavigate,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (e: React.MouseEvent, view: View) => {
    e.preventDefault();
    onNavigate(view);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-[#555555] hover:text-[#212121] transition-colors"
      >
        <img
          src={user.avatar}
          alt="User Avatar"
          className="w-8 h-8 rounded-full border-2 border-white shadow"
        />
        <span>{user.email}</span>
        <i
          className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        ></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E0E0E0] py-2 z-50">
          <div className="px-4 py-2 border-b border-[#E0E0E0]">
            <p className="text-sm font-semibold text-[#212121] truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-[#555555] truncate">{user.email}</p>
          </div>
          <div className="py-2">
            <a
              href="#"
              onClick={(e) => handleNavClick(e, View.Dashboard)}
              className="block px-4 py-2 text-sm text-[#555555] hover:bg-[#F5EFE6] hover:text-[#212121]"
            >
              <i className="fas fa-th-large w-6"></i>Dashboard
            </a>
            <a
              href="#"
              onClick={(e) => handleNavClick(e, View.AccountSettings)}
              className="block px-4 py-2 text-sm text-[#555555] hover:bg-[#F5EFE6] hover:text-[#212121]"
            >
              <i className="fas fa-cog w-6"></i>Account Settings
            </a>
          </div>
          <div className="border-t border-[#E0E0E0] pt-2">
            <button
              onClick={handleLogoutClick}
              className="w-full text-left px-4 py-2 text-sm text-[#C87550] hover:bg-[#F5EFE6] hover:text-[#212121]"
            >
              <i className="fas fa-sign-out-alt w-6"></i>Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
