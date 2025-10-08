# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare AI Agent starter template for building chat-based AI applications. It demonstrates the Cloudflare `agents` SDK with OpenAI integration, human-in-the-loop tool confirmations, task scheduling, and a React-based chat UI.

## Essential Commands

### Development

```bash
npm start                 # Start local development server with Vite
npm run deploy           # Build with Vite and deploy to Cloudflare Workers
npm test                 # Run tests with Vitest
npm run types            # Generate TypeScript types from wrangler config
npm run check            # Run Prettier check, Biome lint, and TypeScript check
npm run format           # Format code with Prettier
```

### Environment Setup

This project uses Workers AI, which requires no API keys or environment variables. The AI binding is configured in `wrangler.jsonc`.

## Architecture

### Agent System (Cloudflare Agents SDK)

**Chat Agent (`src/server.ts`)**: The core `Chat` class extends `AIChatAgent<Env>` from the `agents` package. This is a Durable Object that maintains conversation state using embedded SQLite storage.

- **State Management**: All chat messages are persisted via the Agent's state system
- **Tool Processing**: Handles both auto-executing tools and human-in-the-loop confirmations
- **Scheduling**: Supports delayed, one-time, and cron-based task scheduling via `this.schedule()`
- **MCP Integration**: Can connect to Model Context Protocol (MCP) servers for additional tools

**Durable Objects Configuration**: The `Chat` agent requires proper wrangler.jsonc setup:

```jsonc
{
  "durable_objects": {
    "bindings": [{ "name": "Chat", "class_name": "Chat" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["Chat"] }]
}
```

The `new_sqlite_classes` migration is mandatory for Agents to persist state.

### Tool System

**Tool Patterns** (`src/tools.ts`):

1. **Auto-executing tools**: Include an `execute` function - run without user confirmation
2. **Confirmation-required tools**: Omit `execute` function - require human approval

Tools requiring confirmation must have their execution logic in the `executions` object. The tool names in `executions` should match the tool names defined in `tools`.

**Tool Call Processing** (`src/utils.ts`):

- `processToolCalls()`: Handles human-in-the-loop confirmations by processing tool output (APPROVAL.YES/NO)
- `cleanupMessages()`: Removes incomplete tool calls before API submission to prevent errors
- Uses the AI SDK's `isToolUIPart()` to identify tool-related message parts

**Current Tools**:

- `getWeatherInformation` - Requires confirmation
- `getLocalTime` - Auto-executes
- `scheduleTask` - Auto-executes, uses `getCurrentAgent<Chat>()` to access agent context
- `getScheduledTasks` - Auto-executes, lists all scheduled tasks
- `cancelScheduledTask` - Auto-executes, cancels tasks by ID

### Frontend Architecture

**Main App** (`src/app.tsx`): React application that renders the chat interface. Uses the `agents/react` library to connect to the Chat agent.

**UI Components** (`src/components/`): Modular component library including:

- `tool-invocation-card`: Displays tool calls and confirmation dialogs
- Radix UI-based primitives (avatar, button, dropdown, etc.)
- `memoized-markdown`: Optimized markdown rendering

**Styling**: Uses Tailwind CSS v4 with the `@tailwindcss/vite` plugin. Path alias `@/*` maps to `./src/*`.

### Request Routing

**Entry Point** (`src/server.ts` default export):

- Uses `routeAgentRequest(request, env)` to automatically route HTTP/WebSocket requests to agents
- Routes follow pattern `/agents/:agent/:name`
- Returns 404 for non-agent routes

### AI SDK Integration

**Model Configuration**: Uses Vercel AI SDK with Workers AI provider (`workers-ai-provider`). Model is configured in `src/server.ts`:

```typescript
const workersai = createWorkersAI({ binding: this.env.AI });
const model = workersai("@cf/meta/llama-3.1-8b-instruct");
```

**Streaming**: Uses `streamText()` from AI SDK with:

- `createUIMessageStream()` for response streaming
- `convertToModelMessages()` to transform UI messages to model format
- `stepCountIs(10)` to limit multi-step tool calling iterations

**Available Workers AI Models**: See [Cloudflare Workers AI Models](https://developers.cloudflare.com/workers-ai/models/) for the full list. Popular options include:

- `@cf/meta/llama-3.1-8b-instruct` (default)
- `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`

**Alternative Providers**: Can swap Workers AI for OpenAI or Anthropic by:

1. Installing alternative provider (e.g., `@ai-sdk/openai`, `@ai-sdk/anthropic`)
2. Adding necessary environment variables (e.g., `OPENAI_API_KEY`)
3. Updating model initialization in `src/server.ts`

## Key Development Patterns

### Adding New Tools

1. Define tool in `src/tools.ts`:

```typescript
const myTool = tool({
  description: "tool description",
  inputSchema: z.object({ param: z.string() }),
  execute: async ({ param }) => {
    // Auto-executes if function provided
    return result;
  }
});
```

2. Add to `tools` export
3. If confirmation required (no `execute`), add to `executions` object

### Agent Scheduling

Agents can schedule tasks using `this.schedule(when, callback, data)`:

- `when`: Delay in seconds, Date object, or cron string
- `callback`: Method name on the Agent to invoke
- `data`: Payload passed to the callback

Example:

```typescript
await this.schedule(10, "executeTask", { message: "hello" });
await this.schedule(new Date("2025-01-01"), "executeTask", {});
await this.schedule("*/10 * * * *", "executeTask", {}); // cron
```

### Accessing Agent Context in Tools

Use `getCurrentAgent<Chat>()` from `agents` package to access the agent instance within auto-executing tools:

```typescript
const { agent } = getCurrentAgent<Chat>();
agent!.schedule(input, "executeTask", description);
```

## Testing

**Framework**: Vitest with `@cloudflare/vitest-pool-workers` for Workers-specific testing
**Config**: `vitest.config.ts` uses Workers pool with wrangler.jsonc configuration
**Test Location**: `tests/index.test.ts`

Run tests with `npm test`.

## TypeScript Configuration

- **Target**: ES2021
- **Module**: ES2022 with Bundler resolution
- **JSX**: react-jsx
- **Strict Mode**: Enabled
- **Path Alias**: `@/*` → `./src/*`
- **Types**: Includes `@cloudflare/workers-types`, `node`, `vite/client`

## Cloudflare-Specific Guidelines

Follow the Cursor rules in `.cursor/rules/cloudflare.mdc`:

- Always use TypeScript with ES modules format
- Keep code in a single file unless specified otherwise
- Use official SDKs when available (e.g., OpenAI SDK, Anthropic SDK)
- Never hardcode secrets - use environment variables
- For Agents, always set `new_sqlite_classes` in migrations
- Use WebSocket Hibernation API (not legacy addEventListener pattern)
- Set `compatibility_flags = ["nodejs_compat"]` in wrangler.jsonc
