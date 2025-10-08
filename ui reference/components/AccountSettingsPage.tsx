import React, { useState } from "react";
import { View, User } from "../types";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ProfileSettings } from "./settings/ProfileSettings";
import { SecuritySettings } from "./settings/SecuritySettings";
import { BillingSettings } from "./settings/BillingSettings";
import { AccountDangerZone } from "./settings/AccountDangerZone";

interface AccountSettingsPageProps {
  user: User;
  onNavigate: (view: View, context?: string) => void;
  onLogout: () => void;
  onUpdateUser: (updatedUserData: Partial<User>) => void;
  initialSection?: string | null;
}

type SettingsSection = "profile" | "security" | "billing" | "danger";

const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  user,
  onNavigate,
  onLogout,
  onUpdateUser,
  initialSection
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    initialSection === "billing" ||
      initialSection === "danger" ||
      initialSection === "profile" ||
      initialSection === "security"
      ? initialSection
      : "profile"
  );

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings user={user} onUpdateUser={onUpdateUser} />;
      case "security":
        return <SecuritySettings />;
      case "billing":
        return <BillingSettings />;
      case "danger":
        return <AccountDangerZone userEmail={user.email} onLogout={onLogout} />;
      default:
        return null;
    }
  };

  const NavLink: React.FC<{
    section: SettingsSection;
    icon: string;
    children: React.ReactNode;
  }> = ({ section, icon, children }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === section ? "bg-[#212121] text-white" : "text-[#555555] hover:bg-gray-100"}`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      {children}
    </button>
  );

  return (
    <div className="text-[#212121] relative min-h-screen flex flex-col px-6 md:px-12">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C87550] opacity-30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#5E837D] opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />

      <main className="flex-grow py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#212121]">
            Account Settings
          </h1>
        </div>
        <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <aside className="md:col-span-1">
            <nav className="space-y-2">
              <NavLink section="profile" icon="fa-user-circle">
                My Profile
              </NavLink>
              <NavLink section="security" icon="fa-shield-alt">
                Security
              </NavLink>
              <NavLink section="billing" icon="fa-credit-card">
                Subscription & Billing
              </NavLink>
              <NavLink section="danger" icon="fa-exclamation-triangle">
                Danger Zone
              </NavLink>
            </nav>
          </aside>
          <div className="md:col-span-3 bg-white/60 backdrop-blur-sm border border-[#E0E0E0] rounded-2xl shadow-lg shadow-black/10 p-8">
            {renderSection()}
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AccountSettingsPage;
