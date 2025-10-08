import React, { useState } from "react";

interface ProjectDangerZoneProps {
  projectName: string;
  onDeleteProject: () => void;
}

export const ProjectDangerZone: React.FC<ProjectDangerZoneProps> = ({
  projectName,
  onDeleteProject
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const isConfirmed = confirmationText === projectName;

  const handleDeleteProject = () => {
    if (isConfirmed) {
      onDeleteProject();
      // The modal will close automatically as the component unmounts.
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-red-500">Danger Zone</h2>
      <div className="mt-8 p-6 border-2 border-red-500/50 rounded-lg">
        <h3 className="text-xl font-bold text-white">Delete Project</h3>
        <p className="mt-2 text-[#aaa]">
          Once you delete this project, there is no going back. Please be
          certain.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-red-700"
        >
          Delete this Project
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#1F1F1F] border border-[#333] rounded-2xl shadow-xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold text-white">
              Are you absolutely sure?
            </h2>
            <div className="mt-4 text-[#aaa]">
              <p>
                This action cannot be undone. This will permanently delete the{" "}
                <strong>{projectName}</strong> project.
              </p>
              <p className="mt-4">
                Please type{" "}
                <strong className="text-white">{projectName}</strong> to
                confirm.
              </p>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="mt-2 block w-full bg-[#2a2a2a] border border-[#3c3c3c] rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <button
                onClick={handleDeleteProject}
                disabled={!isConfirmed}
                className="w-full mt-4 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                I understand the consequences, delete this project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
