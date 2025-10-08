import React from "react";

interface SecuritySettingsProps {
  isModal?: boolean;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  isModal
}) => {
  const headerClasses = isModal
    ? "text-2xl font-bold text-white"
    : "text-3xl font-bold text-[#212121]";
  const subheaderClasses = isModal ? "text-[#aaa] mt-1" : "text-[#555555] mt-1";
  const inputClasses = isModal
    ? "mt-1 block w-full bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-[#C87550]/50"
    : "mt-1 block w-full px-4 py-3 bg-white border border-[#D0D0D0] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C87550]/50";

  return (
    <div>
      <h2 className={headerClasses}>Security</h2>
      <p className={subheaderClasses}>Change your password.</p>
      <div className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="current-password"
            className={`block text-sm font-medium ${isModal ? "text-[#ccc]" : "text-[#555555]"}`}
          >
            Current Password
          </label>
          <input
            type="password"
            id="current-password"
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="new-password"
            className={`block text-sm font-medium ${isModal ? "text-[#ccc]" : "text-[#555555]"}`}
          >
            New Password
          </label>
          <input type="password" id="new-password" className={inputClasses} />
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className={`block text-sm font-medium ${isModal ? "text-[#ccc]" : "text-[#555555]"}`}
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirm-password"
            className={inputClasses}
          />
        </div>
        <div
          className={`pt-4 ${isModal ? "border-t border-[#3c3c3c]" : "border-t border-[#E0E0E0]"} text-right`}
        >
          <button
            className={
              isModal
                ? "bg-[#C87550] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-opacity-90"
                : "bg-[#212121] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-[#333]"
            }
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};
