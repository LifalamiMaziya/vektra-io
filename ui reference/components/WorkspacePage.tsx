import React, { useState, useEffect, useRef, useCallback } from "react";
import type { FileAttachment, ChatMessage, User, Project } from "../types";
import { generateAppCode } from "../services/geminiService";
import { useFileHandler } from "../hooks/useFileHandler";
import { FilePill } from "./FilePill";
import { ProjectSettingsModal } from "./ProjectSettingsModal";
import { View } from "../types";
import { IconLogo, DesktopIcon, TabletIcon, MobileIcon } from "./Icons";

interface WorkspacePageProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
  user: User;
  onNavigate: (view: View, context?: string) => void;
  onLogout: () => void;
  onUpdateUser: (updatedUserData: Partial<User>) => void;
}

const Loader = ({
  message,
  subMessage
}: {
  message: string;
  subMessage: string;
}) => (
  <div className="absolute inset-0 flex items-center justify-center bg-[#2a2a2a] bg-opacity-90 z-10">
    <div className="text-center">
      <svg
        className="animate-spin h-12 w-12 text-[#C87550] mx-auto mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="text-white text-lg font-semibold">{message}</p>
      <p className="text-[#888] text-sm mt-2">{subMessage}</p>
    </div>
  </div>
);

const ChatBubble = ({
  message,
  onRestore,
  isCurrentVersion
}: {
  message: ChatMessage;
  onRestore: (index: number) => void;
  isCurrentVersion: boolean;
}) => {
  const isUser = message.role === "user";
  const textPart = message.parts.find((p) => p.text)?.text;
  const hasVersion = typeof message.versionIndex === "number";

  return (
    <div
      className={`p-5 rounded-xl border border-[#3c3c3c] mt-4 ${isUser ? "bg-[#333]" : "bg-[#2a2a2a]"}`}
    >
      <div className="flex justify-between items-start gap-4">
        <p className="text-white text-sm flex-grow min-w-0 break-words">
          <strong>{isUser ? "You" : "Vektraio"}:</strong>{" "}
          {textPart || "File(s) attached."}
        </p>
        {hasVersion && (
          <button
            onClick={() => onRestore(message.versionIndex!)}
            disabled={isCurrentVersion}
            className="text-xs bg-[#444] hover:bg-[#555] disabled:bg-[#333] disabled:text-[#777] disabled:cursor-not-allowed text-white font-semibold py-1.5 px-3 rounded-full transition-colors flex-shrink-0 flex items-center"
            aria-label={
              isCurrentVersion
                ? "Current version"
                : `Restore version ${message.versionIndex! + 1}`
            }
          >
            <i className="fas fa-history mr-1.5"></i>
            {isCurrentVersion ? "Current" : "Restore"}
          </button>
        )}
      </div>
    </div>
  );
};

const WorkspacePage: React.FC<WorkspacePageProps> = ({
  project,
  onUpdateProject,
  onDeleteProject,
  user,
  onNavigate,
  onLogout,
  onUpdateUser
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const { attachedFiles, handleFileChange, removeFile, clearFiles } =
    useFileHandler();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );

  const callApi = useCallback(
    async (prompt: string, files: FileAttachment[], codeToEdit?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const newCode = await generateAppCode(prompt, files, codeToEdit);
        const updatedVersions = [...project.versions, newCode];
        const newVersionIndex = updatedVersions.length - 1;

        // FIX: Explicitly typing updatedChatHistory as ChatMessage[] provides context to TypeScript,
        // preventing the 'role' property from being widened to 'string'.
        const updatedChatHistory: ChatMessage[] = [
          ...project.chatHistory,
          {
            role: "model",
            parts: [{ text: "I've updated your app. What's next?" }],
            versionIndex: newVersionIndex
          }
        ];

        onUpdateProject({
          ...project,
          versions: updatedVersions,
          chatHistory: updatedChatHistory,
          currentVersionIndex: newVersionIndex
        });
      } catch (e: any) {
        setError(e.message || "An unknown error occurred.");
        // FIX: Explicitly typing updatedChatHistory as ChatMessage[] provides context to TypeScript,
        // preventing the 'role' property from being widened to 'string'.
        const updatedChatHistory: ChatMessage[] = [
          ...project.chatHistory,
          { role: "model", parts: [{ text: `Error: ${e.message}` }] }
        ];
        onUpdateProject({ ...project, chatHistory: updatedChatHistory });
      } finally {
        setIsLoading(false);
        clearFiles();
      }
    },
    [project, onUpdateProject, clearFiles]
  );

  useEffect(() => {
    // Initial generation if no versions exist
    if (project.versions.length === 0) {
      const initialMessage = project.chatHistory[0];
      const initialPrompt =
        initialMessage.parts.find((p) => p.text)?.text || "";
      const initialFiles: FileAttachment[] = initialMessage.parts
        .filter((p) => p.inlineData)
        .map((p) => ({
          name: "attached_file",
          mimeType: p.inlineData!.mimeType,
          data: p.inlineData!.data
        }));

      callApi(initialPrompt, initialFiles);
    }
  }, [project.id]); // Should only run when the project ID changes

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [project.chatHistory]);

  const handleSend = () => {
    if (!chatInput.trim() && attachedFiles.length === 0) return;

    const userMessage: ChatMessage = { role: "user", parts: [] };
    if (chatInput) userMessage.parts.push({ text: chatInput });
    attachedFiles.forEach((f) =>
      userMessage.parts.push({
        inlineData: { mimeType: f.mimeType, data: f.data }
      })
    );

    onUpdateProject({
      ...project,
      chatHistory: [...project.chatHistory, userMessage]
    });

    const codeToEdit =
      project.currentVersionIndex !== -1
        ? project.versions[project.currentVersionIndex]
        : undefined;
    callApi(chatInput, attachedFiles, codeToEdit);
    setChatInput("");
  };

  const handleRestoreVersion = (index: number) => {
    onUpdateProject({ ...project, currentVersionIndex: index });
  };

  const currentCode =
    project.currentVersionIndex !== -1
      ? project.versions[project.currentVersionIndex]
      : "";

  return (
    <div className="bg-[#121212] text-[#E0E0E0] h-screen w-screen grid grid-cols-1 lg:grid-cols-3 antialiased">
      {/* Left Column: AI Chat Interface */}
      <div className="lg:col-span-1 bg-[#1F1F1F] flex flex-col border-r border-[#333] p-4 h-full">
        <header className="flex-shrink-0 flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(View.Landing)}
              title="Go to Landing Page"
              className="transition-opacity hover:opacity-80"
              aria-label="Go to Landing Page"
            >
              <IconLogo size={28} color="#E0E0E0" />
            </button>
            <div className="h-6 w-px bg-[#333]"></div>
            <button
              onClick={() => onNavigate(View.Dashboard)}
              title="Back to Dashboard"
              className="text-[#aaa] hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              aria-label="Back to Dashboard"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Dashboard</span>
            </button>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-[#888] hover:text-white transition-colors"
            aria-label="Open project settings"
          >
            <i className="fas fa-cog text-xl"></i>
          </button>
        </header>

        <div className="flex-shrink-0 border-b border-[#333] mb-6 pb-4">
          <h1
            className="text-2xl font-semibold text-white truncate"
            title={project.name}
          >
            {project.name}
          </h1>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto scrollbar-hide pr-2"
        >
          {project.chatHistory.map((msg, index) => (
            <ChatBubble
              key={index}
              message={msg}
              onRestore={handleRestoreVersion}
              isCurrentVersion={
                msg.versionIndex === project.currentVersionIndex
              }
            />
          ))}
        </div>

        <footer className="flex-shrink-0 bg-[#1F1F1F] border-t border-[#333] pt-4">
          <div className="relative bg-[#1F1F1F] rounded-lg border border-[#333]">
            {attachedFiles.length > 0 && (
              <div className="p-2 border-b border-[#333] scrollbar-hide overflow-x-auto whitespace-nowrap">
                {attachedFiles.map((file, index) => (
                  <FilePill
                    key={index}
                    fileName={file.name}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            )}
            <div className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask to edit this app..."
                className="w-full bg-transparent text-white placeholder-[#888] py-3 pl-4 pr-24 rounded-lg focus:outline-none"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*,.txt,.md,.pdf"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#2a2a2a] w-9 h-9 flex items-center justify-center rounded-lg text-[#888] hover:text-white"
                >
                  <i className="fas fa-paperclip"></i>
                </button>
                <button
                  onClick={handleSend}
                  className="bg-[#C87550] w-9 h-9 flex items-center justify-center text-white rounded-lg hover:bg-opacity-90 transition-opacity"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Right Column: Live Preview */}
      <div className="lg:col-span-2 bg-[#212121] flex flex-col p-4 h-full">
        <header className="flex-shrink-0 flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-white">Live Preview</h1>
          <div className="bg-[#2a2a2a] p-1 rounded-lg flex items-center space-x-1 text-sm">
            <button
              onClick={() => setViewport("desktop")}
              className={`w-10 h-8 flex items-center justify-center rounded-md transition-colors ${viewport === "desktop" ? "bg-[#C87550] text-white" : "text-[#aaa] hover:text-white"}`}
              aria-label="Desktop view"
              title="Desktop view"
            >
              <DesktopIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`w-10 h-8 flex items-center justify-center rounded-md transition-colors ${viewport === "tablet" ? "bg-[#C87550] text-white" : "text-[#aaa] hover:text-white"}`}
              aria-label="Tablet view"
              title="Tablet view"
            >
              <TabletIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`w-10 h-8 flex items-center justify-center rounded-md transition-colors ${viewport === "mobile" ? "bg-[#C87550] text-white" : "text-[#aaa] hover:text-white"}`}
              aria-label="Mobile view"
              title="Mobile view"
            >
              <MobileIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-[#888]">
            <i
              className={`fas fa-circle ${isLoading ? "text-yellow-400" : error ? "text-red-500" : "text-green-400"}`}
            ></i>
            <span>{isLoading ? "Building..." : error ? "Error" : "Ready"}</span>
          </div>
        </header>
        <div className="flex-grow rounded-xl overflow-hidden bg-[#333] relative flex items-center justify-center p-2 md:p-4">
          {isLoading && (
            <Loader
              message="Building your app..."
              subMessage="This may take a moment..."
            />
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center p-8 text-center text-red-200">
              {error}
            </div>
          )}
          <iframe
            title="Live Preview"
            className={`h-full bg-white shadow-2xl rounded-md transition-all duration-300 ease-in-out ${
              viewport === "desktop"
                ? "w-full"
                : viewport === "tablet"
                  ? "w-[768px] max-w-full"
                  : "w-[375px] max-w-full"
            }`}
            srcDoc={currentCode}
          />
        </div>
      </div>
      <ProjectSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        onUpdateUser={onUpdateUser}
        onLogout={onLogout}
        project={project}
        onUpdateProject={onUpdateProject}
        onDeleteProject={onDeleteProject}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default WorkspacePage;
