import { useRef, useState, useEffect } from "react";
import type { FileAttachment, User, Project } from "../../types";
import { View } from "../../types";
import { Paperclip, Sparkle, Code } from "@phosphor-icons/react";

interface LandingPageProps {
  onStartNewProject: (prompt: string, files: FileAttachment[]) => void;
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

const LandingPage = ({
  onStartNewProject,
  onNavigate,
  user,
  onLogout,
  projects,
  onSelectProject,
}: LandingPageProps) => {
  const [prompt, setPrompt] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const filePromises = files.map((file) => {
      return new Promise<FileAttachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const data = base64.split(",")[1];
          resolve({
            name: file.name,
            mimeType: file.type,
            data,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newFiles = await Promise.all(filePromises);
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBuildClick = () => {
    if (!prompt.trim() && attachedFiles.length === 0) return;
    onStartNewProject(prompt, attachedFiles);
    setPrompt("");
    setAttachedFiles([]);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white relative flex flex-col px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="py-6 flex justify-between items-center sticky top-0 backdrop-blur-sm z-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Code size={32} className="text-gray-400" />
          <span className="text-2xl font-bold text-gray-200">Vektra</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => onNavigate(View.Dashboard)}
                className="text-gray-400 hover:text-white font-medium transition-colors hidden sm:block"
              >
                Dashboard
              </button>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-white font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                /* Quick demo login */
                const email = `demo${Date.now()}@vektra.io`;
                onNavigate(View.Dashboard);
              }}
              className="bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Get Started
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center py-12 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 text-gray-300 px-4 py-2 rounded-full mb-8 text-sm font-medium">
            <Sparkle size={16} weight="fill" />
            AI-Powered Web App Builder
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-gray-100 mb-6 leading-tight">
            Build Web Apps with
            <br />
            <span className="text-gray-400">AI Magic</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Describe your idea and watch as AI creates a fully functional web
            application with live preview. No coding required.
          </p>

          {/* Prompt Input */}
          <div className="bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 p-2 max-w-3xl mx-auto border border-gray-700">
            {attachedFiles.length > 0 && (
              <div className="flex gap-2 px-3 py-2 flex-wrap">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                  >
                    <span className="text-gray-300">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={promptInputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBuildClick();
                  }
                }}
                placeholder="Describe your web app idea... (e.g., 'Create a todo list app with dark mode')"
                className="flex-1 px-4 py-4 text-lg bg-transparent focus:outline-none text-gray-200 placeholder-gray-500"
              />

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*,.txt,.md,.pdf"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Attach files"
              >
                <Paperclip size={24} />
              </button>

              <button
                onClick={handleBuildClick}
                disabled={!prompt.trim() && attachedFiles.length === 0}
                className="bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Build App
              </button>
            </div>
          </div>

          {/* Recent Projects */}
          {projects.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-gray-200 mb-6">
                Recent Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.slice(0, 3).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-gray-500 hover:shadow-lg transition-all text-left"
                  >
                    <h3 className="font-semibold text-gray-200 truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {project.versions.length} versions
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>© 2025 Vektra AI. Powered by Cloudflare.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
