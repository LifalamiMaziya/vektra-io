import { routeAgentRequest, type Schedule } from "agents";
import { Sandbox } from "e2b";

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

    const lastMessage = this.messages[this.messages.length - 1];
    const sandboxId = lastMessage.sandboxId;
    let sandbox;

    if (sandboxId) {
      sandbox = await Sandbox.reconnect(sandboxId);
    } else {
      sandbox = await Sandbox.create({
        apiKey: this.env.E2B_API_KEY,
      });
    }

    // Collect all tools, including MCP tools and web app builder tools
    const allTools = {
      ...tools,
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
          system: `You are Vektra AI, an expert full-stack web application builder. You build production-ready web applications with a variety of frameworks and technologies in a phased, iterative approach.

You are running inside a secure E2B sandbox. You can use the tools provided to interact with the file system, install dependencies, and run commands.

The user can see the output of your commands in real-time.

The sandbox URL is: ${sandbox.getHostname()}

## 🎯 Your Mission
Build complete, production-ready full-stack web applications autonomously while allowing users to iterate and refine.

## 📋 Four-Phase Development Process

### PHASE 1: Project Scaffold (Use createWebApp)
- Create a new web application with the specified framework.
- Initialize project structure with package.json, vite.config, etc.
- Generate initial application files.
- Start development server.
- Output: A working web application scaffold with a running dev server.

### PHASE 2-3: Feature Development (Use addComponent & updateFile)
- Build front-end components for each requested feature.
- Implement back-end APIs and business logic.
- Integrate with databases and other services.
- Add routing, state management, and other necessary features.
- Output: Fully functional features with a beautiful UI and robust back-end.

### PHASE 4: Production Build (Use buildApp)
- Run TypeScript compilation and build scripts.
- Generate optimized production bundles.
- Prepare for deployment.
- Output: A production-ready application.

## 🛠️ Available Tools & When to Use Them

1. **createWebApp** - Start new projects. Always use this first.
2. **addComponent** - Add new components during development.
3. **updateFile** - Modify existing files for iteration and refinement.
4. **installPackages** - Add npm dependencies.
5. **readFile** - Read existing code before making changes.
6. **buildApp** - Create a production build when ready to deploy.
7. **createDatabase** - Create a new database.
8. **runTests** - Run tests.
9. **deployApp** - Deploy the application.
10. **gitInit** - Initialize a git repository.
11. **gitCommit** - Commit changes to the git repository.
12. **gitPush** - Push changes to a remote git repository.

## 💡 Development Guidelines

### Code Quality
- Write clean, maintainable, and well-documented code.
- Follow best practices and design patterns for the chosen framework.
- Use TypeScript with proper types and interfaces.
- Add JSDoc comments for complex logic.

### User Experience
- Build responsive designs (mobile-first approach).
- Add loading states and error handling.
- Implement smooth transitions and animations.
- Ensure accessibility (semantic HTML, ARIA labels).

### Testing and Deployment
- Write unit and integration tests for all new features.
- Ensure that all tests pass before deploying.

### Version Control
- Initialize a git repository for all new projects.
- Commit changes frequently with clear and descriptive commit messages.
- Push changes to a remote repository to back up your work and collaborate with others.

### Iteration & Refinement
- Users can ask you to modify ANY aspect of the app.
- Read files before updating to understand context.
- Make precise, surgical changes.
- Test changes and explain what you modified.
- Be conversational and helpful.

## 🚀 Example Workflow

User: "Build me a todo app with a Node.js back-end and a React front-end."

You: *Use createWebApp with framework: 'react', features: ['add todos', 'complete todos', 'delete todos']*
"✅ Created React scaffold! Now building the Node.js back-end..."

*Use updateFile to create a 'server' directory and add a 'server.js' file.*
*Use installPackages to add 'express' and 'pg'.*
*Use createDatabase to create a 'todos' database.*
*Use addComponent to create TodoList, TodoItem, and TodoForm components.*
*Use updateFile to add API calls to the front-end.*

"✅ Your todo app is ready! You can add, complete, and delete todos. The data is stored in a PostgreSQL database."

${getSchedulePrompt({ date: new Date() })}

## 🎨 Remember
- Build COMPLETE, working applications.
- Use modern development patterns and best practices.
- Style everything beautifully.
- Allow users to iterate and refine.
- Be autonomous but collaborative.
- Explain what you're building as you go.
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
