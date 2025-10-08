import React, { useState, useEffect } from "react";
import { View, User, Project } from "../types";
import { GeneralSettings } from "./settings/GeneralSettings";
import { EnvironmentVariablesSettings } from "./settings/EnvironmentVariablesSettings";
import { DataHubSettings } from "./settings/DataHubSettings";
import { IntegrationsSettings } from "./settings/IntegrationsSettings";
import { ProjectDangerZone } from "./settings/ProjectDangerZone";
import { ProfileSettings } from "./settings/ProfileSettings";
import { SecuritySettings } from "./settings/SecuritySettings";
import { BillingSettings } from "./settings/BillingSettings";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedUserData: Partial<User>) => void;
  onLogout: () => void;
  project: Project;
  onUpdateProject: (updatedProjectData: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onNavigate: (view: View, context?: string) => void;
}

type SettingsSection =
  | "general"
  | "envVars"
  | "dataHub"
  | "integrations"
  | "projectDanger"
  | "profile"
  | "security"
  | "billing";

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  project,
  onUpdateProject,
  onDeleteProject,
  onNavigate
}) => {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("general");
  const [currentProject, setCurrentProject] = useState(project);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProject(currentProject);
    onClose();
  };

  const handleCancel = () => {
    setCurrentProject(project); // Reset changes
    onClose();
  };

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <GeneralSettings
            project={currentProject}
            setProject={setCurrentProject}
          />
        );
      case "envVars":
        return (
          <EnvironmentVariablesSettings
            project={currentProject}
            setProject={setCurrentProject}
          />
        );
      case "dataHub":
        return <DataHubSettings />;
      case "integrations":
        return <IntegrationsSettings />;
      case "projectDanger":
        return (
          <ProjectDangerZone
            projectName={project.name}
            onDeleteProject={() => onDeleteProject(project.id)}
          />
        );
      case "profile":
        return (
          <ProfileSettings
            user={user}
            onUpdateUser={onUpdateUser}
            isModal={true}
          />
        );
      case "security":
        return <SecuritySettings isModal={true} />;
      case "billing":
        return <BillingSettings isModal={true} />;
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
      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === section ? "bg-[#333] text-white" : "text-[#aaa] hover:bg-[#2a2a2a] hover:text-white"}`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      {children}
    </button>
  );

  const hasUnsavedChanges =
    JSON.stringify(project) !== JSON.stringify(currentProject);
  const showsSaveButton = ["general", "envVars"].includes(activeSection);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInDown"
      style={{ animationDuration: "0.3s" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#1F1F1F] border border-[#333] rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-[#333] flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </header>

        <div className="flex flex-grow min-h-0">
          {/* Sidebar */}
          <aside className="w-64 bg-[#191919] p-4 border-r border-[#333] flex-shrink-0 overflow-y-auto scrollbar-hide">
            <h3 className="px-3 text-xs font-semibold text-[#888] uppercase tracking-wider">
              Project Settings
            </h3>
            <nav className="mt-2 space-y-1">
              <NavLink section="general" icon="fa-sliders-h">
                General
              </NavLink>
              <NavLink section="envVars" icon="fa-key">
                Environment Variables
              </NavLink>
              <NavLink section="dataHub" icon="fa-database">
                Data Hub
              </NavLink>
              <NavLink section="integrations" icon="fa-plug">
                Integrations
              </NavLink>
              <NavLink section="projectDanger" icon="fa-exclamation-triangle">
                Danger Zone
              </NavLink>
            </nav>

            <h3 className="mt-8 px-3 text-xs font-semibold text-[#888] uppercase tracking-wider">
              Account Settings
            </h3>
            <nav className="mt-2 space-y-1">
              <NavLink section="profile" icon="fa-user-circle">
                My Profile
              </NavLink>
              <NavLink section="security" icon="fa-shield-alt">
                Security
              </NavLink>
              <NavLink section="billing" icon="fa-credit-card">
                Subscription & Billing
              </NavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-grow flex flex-col p-6 overflow-y-auto scrollbar-hide">
            <div className="flex-grow">{renderSection()}</div>
            {showsSaveButton && (
              <footer className="flex-shrink-0 mt-6 pt-6 border-t border-[#333] flex justify-end items-center gap-3">
                {hasUnsavedChanges && (
                  <span className="text-sm text-[#aaa]">
                    You have unsaved changes.
                  </span>
                )}
                <button
                  onClick={handleCancel}
                  className="bg-[#2a2a2a] text-white font-semibold py-2 px-5 rounded-lg hover:bg-[#333]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className="bg-[#C87550] text-white font-semibold py-2 px-5 rounded-lg hover:bg-opacity-90 disabled:bg-[#555] disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </footer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
