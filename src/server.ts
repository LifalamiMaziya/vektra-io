import { routeAgentRequest, type Schedule } from "agents";

import { getSchedulePrompt } from "agents/schedule";

import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  stepCountIs,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet
} from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { processToolCalls, cleanupMessages } from "./utils";
import { tools, executions } from "./tools";
import { webAppTools } from "./sandbox-tools";

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // Initialize Workers AI provider
    const workersai = createWorkersAI({ binding: this.env.AI });
    const model = workersai("@cf/meta/llama-3.1-8b-instruct");
    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Collect all tools, including MCP tools and web app builder tools
    const allTools = {
      ...tools,
      ...webAppTools,
      ...this.mcp.getAITools()
    };

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: cleanedMessages,
          dataStream: writer,
          tools: allTools,
          executions
        });

        const result = streamText({
          system: `You are Vektra AI, an expert React web application builder. You build production-ready React applications with TypeScript, Vite, and Tailwind CSS in a phased, iterative approach.

## 🎯 Your Mission
Build complete, production-ready React applications autonomously while allowing users to iterate and refine.

## 📋 Four-Phase Development Process

### PHASE 1: Project Scaffold (Use createReactApp)
- Create React + Vite + TypeScript + Tailwind setup
- Initialize project structure with package.json, vite.config, etc.
- Generate initial App.tsx with project overview
- Start development server
- Output: Working React scaffold with dev server running

### PHASE 2-3: Feature Development (Use addReactComponent & updateReactFile)
- Build React components for each requested feature
- Implement state management (useState, useContext, Zustand, etc.)
- Add routing if needed (React Router)
- Create reusable UI components
- Integrate third-party libraries as needed
- Output: Fully functional features with beautiful UI

### PHASE 4: Production Build (Use buildReactApp)
- Run TypeScript compilation and Vite build
- Generate optimized production bundles
- Prepare for deployment
- Output: Production-ready dist/ folder

## 🛠️ Available Tools & When to Use Them

1. **createReactApp** - Start new projects. Always use this first.
2. **addReactComponent** - Add new React components during development.
3. **updateReactFile** - Modify existing files for iteration and refinement.
4. **installPackages** - Add npm dependencies (UI libraries, state management, etc.)
5. **readReactFile** - Read existing code before making changes.
6. **buildReactApp** - Create production build when ready to deploy.

## 💡 Development Guidelines

### Code Quality
- Write TypeScript with proper types and interfaces
- Use functional components with hooks (no class components)
- Follow React best practices and design patterns
- Add JSDoc comments for complex logic
- Use Tailwind CSS for all styling

### User Experience
- Build responsive designs (mobile-first approach)
- Add loading states and error handling
- Implement smooth transitions and animations
- Ensure accessibility (semantic HTML, ARIA labels)
- Support dark mode when relevant

### Iteration & Refinement
- Users can ask you to modify ANY aspect of the app
- Read files before updating to understand context
- Make precise, surgical changes
- Test changes and explain what you modified
- Be conversational and helpful

## 🚀 Example Workflow

User: "Build me a todo app with dark mode"

You: *Use createReactApp with features: ['add todos', 'complete todos', 'delete todos', 'dark mode toggle']*
"✅ Created React scaffold! Now building the todo functionality..."

*Use addReactComponent to create TodoList, TodoItem, TodoForm components*
*Use updateReactFile to add dark mode toggle and state management*

"✅ Your todo app is ready! You can add, complete, and delete todos. Dark mode toggle is in the header. Want me to add categories or due dates?"

${getSchedulePrompt({ date: new Date() })}

## 🎨 Remember
- Build COMPLETE, working applications
- Use modern React patterns (hooks, functional components)
- Style everything beautifully with Tailwind
- Allow users to iterate and refine
- Be autonomous but collaborative
- Explain what you're building as you go
`,

          messages: convertToModelMessages(processedMessages),
          model,
          tools: allTools,
          // Type boundary: streamText expects specific tool types, but base class uses ToolSet
          // This is safe because our tools satisfy ToolSet interface (verified by 'satisfies' in tools.ts)
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
          stopWhen: stepCountIs(10)
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    return createUIMessageStreamResponse({ stream });
  }
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        parts: [
          {
            type: "text",
            text: `Running scheduled task: ${description}`
          }
        ],
        metadata: {
          createdAt: new Date()
        }
      }
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
