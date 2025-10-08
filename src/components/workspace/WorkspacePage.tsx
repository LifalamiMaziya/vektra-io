import { useState, useEffect, useRef, useCallback } from "react";
import type { Project, User, ChatMessage, ProjectVersion } from "../../types";
import { View } from "../../types";
import { useAgent } from "agents/react";
import { useAgentChat } from "agents/ai-react";
import type { UIMessage } from "@ai-sdk/react";
import { isToolUIPart } from "ai";
import type { tools } from "../../tools";
import {
  Desktop,
  DeviceTablet,
  DeviceMobile,
  PaperPlaneTilt,
  Stop,
  Gear,
  ArrowLeft,
  Code,
  FileHtml,
  FileCss,
  FileJs
} from "@phosphor-icons/react";
import { MemoizedMarkdown } from "../memoized-markdown";
import { ToolInvocationCard } from "../tool-invocation-card/ToolInvocationCard";

interface WorkspacePageProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  user: User;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const toolsRequiringConfirmation: (keyof typeof tools)[] = [
  "getWeatherInformation"
];

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
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-white text-lg font-semibold">{message}</p>
      <p className="text-[#888] text-sm mt-2">{subMessage}</p>
    </div>
  </div>
);

const WorkspacePage = ({
  project,
  onUpdateProject,
  onDeleteProject,
  user,
  onNavigate,
  onLogout
}: WorkspacePageProps) => {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showFiles, setShowFiles] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const agent = useAgent({
    agent: "chat"
  });

  const [agentInput, setAgentInput] = useState("");

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim()) return;

    const message = agentInput;
    setAgentInput("");

    // Send message to agent
    await sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: message }]
      },
      {}
    );
  };

  const {
    messages: agentMessages,
    addToolResult,
    status,
    sendMessage,
    stop
  } = useAgentChat<unknown, UIMessage<{ createdAt: string }>>({
    agent
  });

  // Parse tool results to extract project data
  useEffect(() => {
    const latestMessage = agentMessages[agentMessages.length - 1];
    if (latestMessage?.role === "assistant") {
      const toolParts = latestMessage.parts?.filter(
        (p) => isToolUIPart(p) && p.state === "result"
      );

      toolParts?.forEach((part) => {
        if (!isToolUIPart(part)) return;

        try {
          const result = JSON.parse(part.result as string);
          if (result.success && result.files) {
            // Create new version with the generated files
            const files = Object.entries(result.files).map(
              ([path, content]) => ({
                path,
                content: content as string,
                language: path.endsWith(".html")
                  ? "html"
                  : path.endsWith(".css")
                    ? "css"
                    : path.endsWith(".js")
                      ? "javascript"
                      : undefined
              })
            );

            const newVersion: ProjectVersion = {
              id: `v${Date.now()}`,
              timestamp: Date.now(),
              files,
              previewUrl: result.previewUrl
            };

            // Update project with new version
            const updatedProject = {
              ...project,
              versions: [...project.versions, newVersion],
              currentVersionIndex: project.versions.length,
              sandboxId: result.sandboxId || project.sandboxId
            };

            onUpdateProject(updatedProject);
          }
        } catch (error) {
          console.error("Failed to parse tool result:", error);
        }
      });
    }
  }, [agentMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [agentMessages]);

  const pendingToolCallConfirmation = agentMessages.some((m: UIMessage) =>
    m.parts?.some(
      (part) =>
        isToolUIPart(part) &&
        part.state === "input-available" &&
        toolsRequiringConfirmation.includes(
          part.type.replace("tool-", "") as keyof typeof tools
        )
    )
  );

  const isLoading = status === "submitted" || status === "streaming";

  const currentVersion =
    project.currentVersionIndex >= 0
      ? project.versions[project.currentVersionIndex]
      : null;

  const currentFiles = currentVersion?.files || [];
  const previewUrl = currentVersion?.previewUrl;

  // Get the HTML file for preview
  const htmlFile = currentFiles.find((f) => f.path.endsWith(".html"));

  const getFileIcon = (path: string) => {
    if (path.endsWith(".html")) return <FileHtml size={16} />;
    if (path.endsWith(".css")) return <FileCss size={16} />;
    if (path.endsWith(".js")) return <FileJs size={16} />;
    return <Code size={16} />;
  };

  return (
    <div className="bg-[#121212] text-[#E0E0E0] h-screen w-screen grid grid-cols-1 lg:grid-cols-[400px_1fr] antialiased overflow-hidden">
      {/* Left Column: AI Chat Interface */}
      <div className="bg-[#1F1F1F] flex flex-col border-r border-[#333] h-full">
        <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(View.Dashboard)}
              title="Back to Dashboard"
              className="text-[#aaa] hover:text-white transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-px bg-[#333]" />
            <span className="text-[#aaa] text-sm font-medium truncate">
              {project.name}
            </span>
          </div>
          <button
            className="text-[#888] hover:text-white transition-colors"
            aria-label="Settings"
          >
            <Gear size={20} />
          </button>
        </header>

        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-4 space-y-4"
        >
          {agentMessages.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#3c3c3c]">
                <p className="text-[#888]">
                  Describe what you want to build or modify...
                </p>
              </div>
            </div>
          )}

          {agentMessages.map((m) => {
            const isUser = m.role === "user";

            return (
              <div key={m.id}>
                <div
                  className={`p-5 rounded-xl border border-[#3c3c3c] ${isUser ? "bg-[#333]" : "bg-[#2a2a2a]"}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow min-w-0">
                      {m.parts?.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <div
                              key={i}
                              className="text-white text-sm break-words"
                            >
                              <strong>{isUser ? "You" : "Vektra AI"}:</strong>{" "}
                              <MemoizedMarkdown
                                id={`${m.id}-${i}`}
                                content={part.text}
                              />
                            </div>
                          );
                        }

                        if (isToolUIPart(part)) {
                          const toolCallId = part.toolCallId;
                          const toolName = part.type.replace("tool-", "");
                          const needsConfirmation =
                            toolsRequiringConfirmation.includes(
                              toolName as keyof typeof tools
                            );

                          return (
                            <ToolInvocationCard
                              key={`${toolCallId}-${i}`}
                              toolUIPart={part}
                              toolCallId={toolCallId}
                              needsConfirmation={needsConfirmation}
                              onSubmit={({ toolCallId, result }) => {
                                addToolResult({
                                  tool: part.type.replace("tool-", ""),
                                  toolCallId,
                                  output: result
                                });
                              }}
                              addToolResult={(toolCallId, result) => {
                                addToolResult({
                                  tool: part.type.replace("tool-", ""),
                                  toolCallId,
                                  output: result
                                });
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <footer className="flex-shrink-0 bg-[#1F1F1F] border-t border-[#333] p-4">
          <div className="relative bg-[#1F1F1F] rounded-lg border border-[#333]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAgentSubmit(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Ask to modify your app..."
                disabled={pendingToolCallConfirmation}
                className="w-full bg-transparent text-white placeholder-[#888] py-3 pl-4 pr-16 rounded-lg focus:outline-none disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="bg-[#C87550] w-9 h-9 flex items-center justify-center text-white rounded-lg hover:bg-opacity-90 transition-opacity"
                  >
                    <Stop size={16} />
                  </button>
                ) : (
                  <button
                    onClick={(e) =>
                      handleAgentSubmit(e as unknown as React.FormEvent)
                    }
                    disabled={!agentInput.trim()}
                    className="bg-[#C87550] w-9 h-9 flex items-center justify-center text-white rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperPlaneTilt size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Right Column: Preview and Files */}
      <div className="bg-[#212121] flex flex-col h-full">
        <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-[#333]">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">Live Preview</h1>
            {currentVersion && (
              <button
                onClick={() => setShowFiles(!showFiles)}
                className="text-sm text-[#aaa] hover:text-white transition-colors"
              >
                {showFiles ? "Hide Files" : "Show Files"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#2a2a2a] p-1 rounded-lg flex items-center space-x-1 text-sm">
              <button
                onClick={() => setViewport("desktop")}
                className={`w-10 h-8 flex items-center justify-center rounded-md transition-colors ${
                  viewport === "desktop"
                    ? "bg-[#C87550] text-white"
                    : "text-[#aaa] hover:text-white"
                }`}
                aria-label="Desktop view"
                title="Desktop view"
              >
                <Desktop size={20} />
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`w-10 h-8 flex items-center justify-center rounded-md transition-colors ${
                  viewport === "tablet"
                    ? "bg-[#C87550] text-white"
                    : "text-[#aaa] hover:text-white"
                }`}
                aria-label="Tablet view"
                title="Tablet view"
              >
                <DeviceTablet size={20} />
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`w-10 h-8 flex items-center justify-center rounded-md transition-colors ${
                  viewport === "mobile"
                    ? "bg-[#C87550] text-white"
                    : "text-[#aaa] hover:text-white"
                }`}
                aria-label="Mobile view"
                title="Mobile view"
              >
                <DeviceMobile size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-[#888]">
              <div
                className={`w-2 h-2 rounded-full ${isLoading ? "bg-yellow-400" : "bg-green-400"}`}
              />
              <span>{isLoading ? "Building..." : "Ready"}</span>
            </div>
          </div>
        </header>

        <div className="flex-grow flex overflow-hidden">
          {/* File List */}
          {showFiles && currentFiles.length > 0 && (
            <div className="w-64 border-r border-[#333] bg-[#1a1a1a] overflow-y-auto">
              <div className="p-3 border-b border-[#333]">
                <h3 className="text-sm font-semibold text-white">Files</h3>
              </div>
              <div className="p-2">
                {currentFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file.path)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFile === file.path
                        ? "bg-[#C87550] text-white"
                        : "text-[#aaa] hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    {getFileIcon(file.path)}
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className="flex-grow flex items-center justify-center p-4 md:p-8 overflow-auto">
            <div className="relative w-full h-full flex items-center justify-center">
              {isLoading && (
                <Loader
                  message="Building your app..."
                  subMessage="AI is generating your code..."
                />
              )}

              {selectedFile ? (
                // Show code editor
                <div className="w-full h-full bg-[#1e1e1e] rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm text-[#d4d4d4] overflow-auto h-full">
                    <code>
                      {currentFiles.find((f) => f.path === selectedFile)
                        ?.content || ""}
                    </code>
                  </pre>
                </div>
              ) : htmlFile ? (
                // Show live preview
                <div
                  className={`bg-white shadow-2xl rounded-md transition-all duration-300 ease-in-out h-full ${
                    viewport === "desktop"
                      ? "w-full"
                      : viewport === "tablet"
                        ? "w-[768px] max-w-full"
                        : "w-[375px] max-w-full"
                  }`}
                >
                  <iframe
                    title="Live Preview"
                    srcDoc={htmlFile.content}
                    className="w-full h-full rounded-md"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              ) : (
                // Empty state
                <div className="text-center text-[#888]">
                  <p className="text-lg">No preview available</p>
                  <p className="text-sm mt-2">
                    Start chatting with the AI to build your app
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
