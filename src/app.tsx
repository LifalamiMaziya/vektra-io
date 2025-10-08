/** biome-ignore-all lint/correctness/useUniqueElementIds: it's alright */
import { useEffect, useState, useRef, useCallback } from "react";
import { useAgent } from "agents/react";
import { isToolUIPart } from "ai";
import { useAgentChat } from "agents/ai-react";
import type { UIMessage } from "@ai-sdk/react";
import type { tools } from "./tools";

// Component imports
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";

// Icon imports
import {
  Desktop,
  DeviceTablet,
  DeviceMobile,
  PaperPlaneTilt,
  Stop,
  Gear
} from "@phosphor-icons/react";

// List of tools that require human confirmation
// NOTE: this should match the tools that don't have execute functions in tools.ts
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

const CloudflareAgentLogo = () => (
  <svg width="28px" height="28px" className="text-[#E0E0E0]" data-icon="agents">
    <title>Vektra AI</title>
    <symbol id="ai:local:agents" viewBox="0 0 80 79">
      <path
        fill="currentColor"
        d="M69.3 39.7c-3.1 0-5.8 2.1-6.7 5H48.3V34h4.6l4.5-2.5c1.1.8 2.5 1.2 3.9 1.2 3.8 0 7-3.1 7-7s-3.1-7-7-7-7 3.1-7 7c0 .9.2 1.8.5 2.6L51.9 30h-3.5V18.8h-.1c-1.3-1-2.9-1.6-4.5-1.9h-.2c-1.9-.3-3.9-.1-5.8.6-.4.1-.8.3-1.2.5h-.1c-.1.1-.2.1-.3.2-1.7 1-3 2.4-4 4 0 .1-.1.2-.1.2l-.3.6c0 .1-.1.1-.1.2v.1h-.6c-2.9 0-5.7 1.2-7.7 3.2-2.1 2-3.2 4.8-3.2 7.7 0 .7.1 1.4.2 2.1-1.3.9-2.4 2.1-3.2 3.5s-1.2 2.9-1.4 4.5c-.1 1.6.1 3.2.7 4.7s1.5 2.9 2.6 4c-.8 1.8-1.2 3.7-1.1 5.6 0 1.9.5 3.8 1.4 5.6s2.1 3.2 3.6 4.4c1.3 1 2.7 1.7 4.3 2.2v-.1q2.25.75 4.8.6h.1c0 .1.1.1.1.1.9 1.7 2.3 3 4 4 .1.1.2.1.3.2h.1c.4.2.8.4 1.2.5 1.4.6 3 .8 4.5.7.4 0 .8-.1 1.3-.1h.1c1.6-.3 3.1-.9 4.5-1.9V62.9h3.5l3.1 1.7c-.3.8-.5 1.7-.5 2.6 0 3.8 3.1 7 7 7s7-3.1 7-7-3.1-7-7-7c-1.5 0-2.8.5-3.9 1.2l-4.6-2.5h-4.6V48.7h14.3c.9 2.9 3.5 5 6.7 5 3.8 0 7-3.1 7-7s-3.1-7-7-7m-7.9-16.9c1.6 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.4-3 3-3m0 41.4c1.6 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.4-3 3-3M44.3 72c-.4.2-.7.3-1.1.3-.2 0-.4.1-.5.1h-.2c-.9.1-1.7 0-2.6-.3-1-.3-1.9-.9-2.7-1.7-.7-.8-1.3-1.7-1.6-2.7l-.3-1.5v-.7q0-.75.3-1.5c.1-.2.1-.4.2-.7s.3-.6.5-.9c0-.1.1-.1.1-.2.1-.1.1-.2.2-.3s.1-.2.2-.3c0 0 0-.1.1-.1l.6-.6-2.7-3.5c-1.3 1.1-2.3 2.4-2.9 3.9-.2.4-.4.9-.5 1.3v.1c-.1.2-.1.4-.1.6-.3 1.1-.4 2.3-.3 3.4-.3 0-.7 0-1-.1-2.2-.4-4.2-1.5-5.5-3.2-1.4-1.7-2-3.9-1.8-6.1q.15-1.2.6-2.4l.3-.6c.1-.2.2-.4.3-.5 0 0 0-.1.1-.1.4-.7.9-1.3 1.5-1.9 1.6-1.5 3.8-2.3 6-2.3q1.05 0 2.1.3v-4.5c-.7-.1-1.4-.2-2.1-.2-1.8 0-3.5.4-5.2 1.1-.7.3-1.3.6-1.9 1s-1.1.8-1.7 1.3c-.3.2-.5.5-.8.8-.6-.8-1-1.6-1.3-2.6-.2-1-.2-2 0-2.9.2-1 .6-1.9 1.3-2.6.6-.8 1.4-1.4 2.3-1.8l1.8-.9-.7-1.9c-.4-1-.5-2.1-.4-3.1s.5-2.1 1.1-2.9q.9-1.35 2.4-2.1c.9-.5 2-.8 3-.7.5 0 1 .1 1.5.2 1 .2 1.8.7 2.6 1.3s1.4 1.4 1.8 2.3l4.1-1.5c-.9-2-2.3-3.7-4.2-4.9q-.6-.3-.9-.6c.4-.7 1-1.4 1.6-1.9.8-.7 1.8-1.1 2.9-1.3.9-.2 1.7-.1 2.6 0 .4.1.7.2 1.1.3V72zm25-22.3c-1.6 0-3-1.3-3-3 0-1.6 1.3-3 3-3s3 1.3 3 3c0 1.6-1.3 3-3 3"
      />
    </symbol>
    <use href="#ai:local:agents" />
  </svg>
);

export default function Chat() {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Apply dark theme
  useEffect(() => {
    document.body.style.backgroundColor = "#121212";
    document.body.classList.add("bg-[#121212]");
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }, []);

  const agent = useAgent({
    agent: "chat"
  });

  const [agentInput, setAgentInput] = useState("");

  const handleAgentSubmit = async (
    e: React.FormEvent,
    extraData: Record<string, unknown> = {}
  ) => {
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
      {
        body: extraData
      }
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

  return (
    <div className="bg-[#121212] text-[#E0E0E0] h-screen w-screen grid grid-cols-1 lg:grid-cols-3 antialiased">
      {/* Left Column: AI Chat Interface */}
      <div className="lg:col-span-1 bg-[#1F1F1F] flex flex-col border-r border-[#333] p-4 h-full">
        <header className="flex-shrink-0 flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              title="Vektra AI"
              className="transition-opacity hover:opacity-80"
              aria-label="Vektra AI"
            >
              <CloudflareAgentLogo />
            </button>
            <div className="h-6 w-px bg-[#333]" />
            <span className="text-[#aaa] text-sm font-medium">
              AI Workspace
            </span>
          </div>
          <button
            className="text-[#888] hover:text-white transition-colors"
            aria-label="Settings"
          >
            <Gear size={20} />
          </button>
        </header>

        <div className="flex-shrink-0 border-b border-[#333] mb-6 pb-4">
          <h1 className="text-2xl font-semibold text-white">AI Chat Agent</h1>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto pr-2 space-y-4"
        >
          {agentMessages.map((m, index) => {
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
                            // biome-ignore lint/suspicious/noArrayIndexKey: immutable index
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
                              // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe here
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

        <footer className="flex-shrink-0 bg-[#1F1F1F] border-t border-[#333] pt-4">
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
                placeholder="Ask your AI assistant..."
                disabled={pendingToolCallConfirmation}
                className="w-full bg-transparent text-white placeholder-[#888] py-3 pl-4 pr-24 rounded-lg focus:outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
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

      {/* Right Column: Live Preview */}
      <div className="lg:col-span-2 bg-[#212121] flex flex-col p-4 h-full">
        <header className="flex-shrink-0 flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-white">Live Preview</h1>
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
            <i
              className={`fas fa-circle ${isLoading ? "text-yellow-400" : "text-green-400"}`}
            />
            <span>{isLoading ? "Building..." : "Ready"}</span>
          </div>
        </header>
        <div className="flex-grow rounded-xl overflow-hidden bg-[#333] relative flex items-center justify-center p-2 md:p-4">
          {isLoading && (
            <Loader
              message="Processing..."
              subMessage="Your AI is thinking..."
            />
          )}
          <div
            className={`h-full bg-white shadow-2xl rounded-md transition-all duration-300 ease-in-out flex items-center justify-center ${
              viewport === "desktop"
                ? "w-full"
                : viewport === "tablet"
                  ? "w-[768px] max-w-full"
                  : "w-[375px] max-w-full"
            }`}
          >
            <p className="text-neutral-600 text-center p-8">
              Live preview will appear here when generating content
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
