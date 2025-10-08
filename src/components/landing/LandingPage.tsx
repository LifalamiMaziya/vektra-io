import { useRef, useState, useEffect } from "react";
import type { FileAttachment, User, Project } from "../../types";
import { View } from "../../types";
import { Paperclip, Sparkle } from "@phosphor-icons/react";

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
  onSelectProject
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
            data
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
    <div className="min-h-screen text-[#212121] relative flex flex-col px-6 md:px-12">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C87550] opacity-30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#5E837D] opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {/* Header */}
      <header className="py-6 flex justify-between items-center sticky top-0 backdrop-blur-sm z-50 -mx-6 md:-mx-12 px-6 md:px-12">
        <div className="flex items-center gap-3">
          <svg
            width="32"
            height="32"
            viewBox="0 0 80 79"
            className="text-[#C87550]"
          >
            <path
              fill="currentColor"
              d="M69.3 39.7c-3.1 0-5.8 2.1-6.7 5H48.3V34h4.6l4.5-2.5c1.1.8 2.5 1.2 3.9 1.2 3.8 0 7-3.1 7-7s-3.1-7-7-7-7 3.1-7 7c0 .9.2 1.8.5 2.6L51.9 30h-3.5V18.8h-.1c-1.3-1-2.9-1.6-4.5-1.9h-.2c-1.9-.3-3.9-.1-5.8.6-.4.1-.8.3-1.2.5h-.1c-.1.1-.2.1-.3.2-1.7 1-3 2.4-4 4 0 .1-.1.2-.1.2l-.3.6c0 .1-.1.1-.1.2v.1h-.6c-2.9 0-5.7 1.2-7.7 3.2-2.1 2-3.2 4.8-3.2 7.7 0 .7.1 1.4.2 2.1-1.3.9-2.4 2.1-3.2 3.5s-1.2 2.9-1.4 4.5c-.1 1.6.1 3.2.7 4.7s1.5 2.9 2.6 4c-.8 1.8-1.2 3.7-1.1 5.6 0 1.9.5 3.8 1.4 5.6s2.1 3.2 3.6 4.4c1.3 1 2.7 1.7 4.3 2.2v-.1q2.25.75 4.8.6h.1c0 .1.1.1.1.1.9 1.7 2.3 3 4 4 .1.1.2.1.3.2h.1c.4.2.8.4 1.2.5 1.4.6 3 .8 4.5.7.4 0 .8-.1 1.3-.1h.1c1.6-.3 3.1-.9 4.5-1.9V62.9h3.5l3.1 1.7c-.3.8-.5 1.7-.5 2.6 0 3.8 3.1 7 7 7s7-3.1 7-7-3.1-7-7-7c-1.5 0-2.8.5-3.9 1.2l-4.6-2.5h-4.6V48.7h14.3c.9 2.9 3.5 5 6.7 5 3.8 0 7-3.1 7-7s-3.1-7-7-7m-7.9-16.9c1.6 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.4-3 3-3m0 41.4c1.6 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.4-3 3-3M44.3 72c-.4.2-.7.3-1.1.3-.2 0-.4.1-.5.1h-.2c-.9.1-1.7 0-2.6-.3-1-.3-1.9-.9-2.7-1.7-.7-.8-1.3-1.7-1.6-2.7l-.3-1.5v-.7q0-.75.3-1.5c.1-.2.1-.4.2-.7s.3-.6.5-.9c0-.1.1-.1.1-.2.1-.1.1-.2.2-.3s.1-.2.2-.3c0 0 0-.1.1-.1l.6-.6-2.7-3.5c-1.3 1.1-2.3 2.4-2.9 3.9-.2.4-.4.9-.5 1.3v.1c-.1.2-.1.4-.1.6-.3 1.1-.4 2.3-.3 3.4-.3 0-.7 0-1-.1-2.2-.4-4.2-1.5-5.5-3.2-1.4-1.7-2-3.9-1.8-6.1q.15-1.2.6-2.4l.3-.6c.1-.2.2-.4.3-.5 0 0 0-.1.1-.1.4-.7.9-1.3 1.5-1.9 1.6-1.5 3.8-2.3 6-2.3q1.05 0 2.1.3v-4.5c-.7-.1-1.4-.2-2.1-.2-1.8 0-3.5.4-5.2 1.1-.7.3-1.3.6-1.9 1s-1.1.8-1.7 1.3c-.3.2-.5.5-.8.8-.6-.8-1-1.6-1.3-2.6-.2-1-.2-2 0-2.9.2-1 .6-1.9 1.3-2.6.6-.8 1.4-1.4 2.3-1.8l1.8-.9-.7-1.9c-.4-1-.5-2.1-.4-3.1s.5-2.1 1.1-2.9q.9-1.35 2.4-2.1c.9-.5 2-.8 3-.7.5 0 1 .1 1.5.2 1 .2 1.8.7 2.6 1.3s1.4 1.4 1.8 2.3l4.1-1.5c-.9-2-2.3-3.7-4.2-4.9q-.6-.3-.9-.6c.4-.7 1-1.4 1.6-1.9.8-.7 1.8-1.1 2.9-1.3.9-.2 1.7-.1 2.6 0 .4.1.7.2 1.1.3V72zm25-22.3c-1.6 0-3-1.3-3-3 0-1.6 1.3-3 3-3s3 1.3 3 3c0 1.6-1.3 3-3 3"
            />
          </svg>
          <span className="text-2xl font-bold text-[#212121]">Vektra</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={() => onNavigate(View.Dashboard)}
                className="text-[#555555] hover:text-[#212121] font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={onLogout}
                className="text-[#555555] hover:text-[#212121] font-medium transition-colors"
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
              className="bg-[#212121] text-white font-semibold py-2 px-5 rounded-lg hover:bg-[#333333] transition-colors"
            >
              Get Started
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C87550]/10 text-[#C87550] px-4 py-2 rounded-full mb-8 text-sm font-medium">
            <Sparkle size={16} weight="fill" />
            AI-Powered Web App Builder
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-[#212121] mb-6 leading-tight">
            Build Web Apps with
            <br />
            <span className="text-[#C87550]">AI Magic</span>
          </h1>

          <p className="text-xl text-[#555555] mb-12 max-w-2xl mx-auto">
            Describe your idea and watch as AI creates a fully functional web
            application with live preview. No coding required.
          </p>

          {/* Prompt Input */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 p-2 max-w-3xl mx-auto border border-[#E0E0E0]">
            {attachedFiles.length > 0 && (
              <div className="flex gap-2 px-3 py-2 flex-wrap">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-[#F5F5F5] px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                  >
                    <span className="text-[#555555]">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-[#C87550] hover:text-[#A85540]"
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
                className="flex-1 px-4 py-4 text-lg bg-transparent focus:outline-none text-[#212121] placeholder-[#888888]"
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
                className="p-3 hover:bg-[#F5F5F5] rounded-lg transition-colors text-[#555555] hover:text-[#212121]"
                title="Attach files"
              >
                <Paperclip size={24} />
              </button>

              <button
                onClick={handleBuildClick}
                disabled={!prompt.trim() && attachedFiles.length === 0}
                className="bg-[#C87550] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#A85540] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Build App
              </button>
            </div>
          </div>

          {/* Recent Projects */}
          {projects.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-[#212121] mb-6">
                Recent Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.slice(0, 3).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="bg-white border border-[#E0E0E0] rounded-xl p-4 hover:border-[#C87550] hover:shadow-lg transition-all text-left"
                  >
                    <h3 className="font-semibold text-[#212121] truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-[#555555] mt-1">
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
      <footer className="py-8 text-center text-[#888888] text-sm border-t border-[#E0E0E0]">
        <p>© 2025 Vektra AI. Powered by Cloudflare.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
