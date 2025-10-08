import React, { useState } from "react";
import type { Project, EnvironmentVariable } from "../../types";

interface EnvironmentVariablesSettingsProps {
  project: Project;
  setProject: (project: Project) => void;
}

export const EnvironmentVariablesSettings: React.FC<
  EnvironmentVariablesSettingsProps
> = ({ project, setProject }) => {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddVariable = () => {
    const newVar: EnvironmentVariable = {
      id: Date.now().toString(),
      name: "",
      value: ""
    };
    setProject({ ...project, envVars: [...project.envVars, newVar] });
  };

  const handleRemoveVariable = (id: string) => {
    setProject({
      ...project,
      envVars: project.envVars.filter((v) => v.id !== id)
    });
  };

  const handleChange = (id: string, field: "name" | "value", text: string) => {
    const updatedVars = project.envVars.map((v) =>
      v.id === id ? { ...v, [field]: text } : v
    );
    setProject({ ...project, envVars: updatedVars });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Environment Variables</h2>
      <p className="text-[#aaa] mt-1">
        Manage secret keys and tokens for your project.
      </p>

      <div className="mt-8 space-y-4">
        {project.envVars.map((envVar) => (
          <div key={envVar.id} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Variable Name"
              value={envVar.name}
              onChange={(e) => handleChange(envVar.id, "name", e.target.value)}
              className="flex-grow bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-white placeholder-[#888] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#C87550]/50 font-mono text-sm"
            />
            <div className="flex-grow relative">
              <input
                type={showValues[envVar.id] ? "text" : "password"}
                placeholder="Value"
                value={envVar.value}
                onChange={(e) =>
                  handleChange(envVar.id, "value", e.target.value)
                }
                className="w-full bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-white placeholder-[#888] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#C87550]/50 font-mono text-sm"
              />
              <button
                onClick={() => toggleShowValue(envVar.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-white"
              >
                <i
                  className={`fas ${showValues[envVar.id] ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
            <button
              onClick={() => handleRemoveVariable(envVar.id)}
              className="text-[#aaa] hover:text-red-500 transition-colors p-2"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleAddVariable}
          className="bg-[#2a2a2a] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#333]"
        >
          <i className="fas fa-plus mr-2"></i> Add Variable
        </button>
      </div>
    </div>
  );
};
