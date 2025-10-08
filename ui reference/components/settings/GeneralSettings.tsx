import React from "react";
import type { Project } from "../../types";

interface GeneralSettingsProps {
  project: Project;
  setProject: (project: Project) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  project,
  setProject
}) => {
  const handleChange = (field: "name" | "description", value: string) => {
    setProject({ ...project, [field]: value });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">General</h2>
      <p className="text-[#aaa] mt-1">
        Manage your project's name and description.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="project-name"
            className="block text-sm font-medium text-[#ccc]"
          >
            Project Name
          </label>
          <input
            type="text"
            id="project-name"
            value={project.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-1 block w-full bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-white placeholder-[#888] p-3 focus:outline-none focus:ring-2 focus:ring-[#C87550]/50"
          />
        </div>
        <div>
          <label
            htmlFor="project-description"
            className="block text-sm font-medium text-[#ccc]"
          >
            Description
          </label>
          <textarea
            id="project-description"
            rows={3}
            value={project.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="mt-1 block w-full bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-white placeholder-[#888] p-3 focus:outline-none focus:ring-2 focus:ring-[#C87550]/50"
          />
        </div>
      </div>
    </div>
  );
};
