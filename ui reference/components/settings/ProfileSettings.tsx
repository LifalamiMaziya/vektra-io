import React, { useState } from "react";
import { User } from "../../types";

interface ProfileSettingsProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  isModal?: boolean;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  onUpdateUser,
  isModal
}) => {
  const [name, setName] = useState(user.name || "");

  const handleSave = () => {
    onUpdateUser({ name });
  };

  const isChanged = name !== user.name;

  const headerClasses = isModal
    ? "text-2xl font-bold text-white"
    : "text-3xl font-bold text-[#212121]";
  const subheaderClasses = isModal ? "text-[#aaa] mt-1" : "text-[#555555] mt-1";
  const inputClasses = isModal
    ? "mt-1 block w-full bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-white placeholder-[#888] p-3 focus:outline-none focus:ring-2 focus:ring-[#C87550]/50"
    : "mt-1 block w-full px-4 py-3 bg-white border border-[#D0D0D0] rounded-lg shadow-sm placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#C87550]/50";
  const disabledInputClasses = isModal
    ? "mt-1 block w-full bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-[#aaa]"
    : "mt-1 block w-full px-4 py-3 bg-gray-100 border border-[#D0D0D0] rounded-lg shadow-sm";

  return (
    <div>
      <h2 className={headerClasses}>My Profile</h2>
      <p className={subheaderClasses}>Manage your personal information.</p>
      <div className="mt-8 space-y-6">
        <div>
          <label
            className={`block text-sm font-medium ${isModal ? "text-[#ccc]" : "text-[#555555]"}`}
          >
            Profile Picture
          </label>
          <div className="mt-2 flex items-center gap-4">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full"
            />
            <button
              className={
                isModal
                  ? "bg-[#2a2a2a] border border-[#3c3c3c] py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#333] text-white"
                  : "bg-white border border-[#D0D0D0] py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-50"
              }
            >
              Change
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="name"
            className={`block text-sm font-medium ${isModal ? "text-[#ccc]" : "text-[#555555]"}`}
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className={`block text-sm font-medium ${isModal ? "text-[#ccc]" : "text-[#555555]"}`}
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            disabled
            className={`${disabledInputClasses} p-3`}
          />
        </div>
        <div
          className={`pt-4 ${isModal ? "border-t border-[#3c3c3c]" : "border-t border-[#E0E0E0]"} text-right`}
        >
          <button
            onClick={handleSave}
            disabled={!isChanged}
            className={
              isModal
                ? "bg-[#C87550] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-opacity-90 disabled:bg-[#555] disabled:cursor-not-allowed"
                : "bg-[#212121] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-[#333] disabled:bg-gray-300 disabled:cursor-not-allowed"
            }
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
