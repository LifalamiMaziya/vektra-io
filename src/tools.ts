/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";
import { Sandbox } from "e2b";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";

// Helper type for accessing Sandbox binding
type ChatWithSandbox = Chat & { env: Env & { E2B_API_KEY: string } };

function getAgentWithSandbox(): ChatWithSandbox | null {
  const ctx = getCurrentAgent<Chat>();
  if (!ctx?.agent) return null;
  return ctx.agent as ChatWithSandbox;
}

/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 */
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  inputSchema: z.object({ city: z.string() })
  // Omitting execute function makes this tool require human confirmation
});

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: "get the local time for a specified location",
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  }
});

const scheduleTask = tool({
  description: "A tool to schedule a task to be executed at a later time",
  inputSchema: scheduleSchema,
  execute: async ({ when, description }) => {
    // we can now read the agent context from the ALS store
    const { agent } = getCurrentAgent<Chat>();

    function throwError(msg: string): string {
      throw new Error(msg);
    }
    if (when.type === "no-schedule") {
      return "Not a valid schedule input";
    }
    const input =
      when.type === "scheduled"
        ? when.date // scheduled
        : when.type === "delayed"
          ? when.delayInSeconds // delayed
          : when.type === "cron"
            ? when.cron // cron
            : throwError("not a valid schedule input");
    try {
      agent!.schedule(input!, "executeTask", description);
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for type "${when.type}" : ${input}`;
  }
});

/**
 * Tool to list all scheduled tasks
 * This executes automatically without requiring human confirmation
 */
const getScheduledTasks = tool({
  description: "List all tasks that have been scheduled",
  inputSchema: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const tasks = agent!.getSchedules();
      if (!tasks || tasks.length === 0) {
        return "No scheduled tasks found.";
      }
      return tasks;
    } catch (error) {
      console.error("Error listing scheduled tasks", error);
      return `Error listing scheduled tasks: ${error}`;
    }
  }
});

/**
 * Tool to cancel a scheduled task by its ID
 * This executes automatically without requiring human confirmation
 */
const cancelScheduledTask = tool({
  description: "Cancel a scheduled task using its ID",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to cancel")
  }),
  execute: async ({ taskId }) => {
    const { agent } = getCurrentAgent<Chat>();
    try {
      await agent!.cancelSchedule(taskId);
      return `Task ${taskId} has been successfully canceled.`;
    } catch (error) {
      console.error("Error canceling scheduled task", error);
      return `Error canceling task ${taskId}: ${error}`;
    }
  }
});

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  createWebApp: tool({
    description:
      "Creates a new production-ready web application with a specified framework. Use this when the user wants to build a new web app. This is PHASE 1: Initial scaffold and project setup.",
    inputSchema: z.object({
      projectName: z
        .string()
        .describe("Name of the project (e.g., 'todo-app', 'portfolio')"),
      description: z.string().describe("Description of what the app should do"),
      features: z
        .array(z.string())
        .describe(
          "List of features to implement (e.g., ['dark mode', 'authentication', 'responsive design'])"
        ),
      framework: z
        .enum(["react", "vue", "svelte"])
        .describe("The front-end framework to use"),
    }),
    execute: async ({ projectName, description, features }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.create({
          apiKey: agent.env.E2B_API_KEY,
        });

        // Package.json configuration
        const packageJson = {
          name: projectName,
          private: true,
          version: "0.1.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "tsc && vite build",
            preview: "vite preview"
          },
          dependencies: {
            react: "^18.3.1",
            "react-dom": "^18.3.1"
          },
          devDependencies: {
            "@types/react": "^18.3.1",
            "@types/react-dom": "^18.3.0",
            "@vitejs/plugin-react": "^4.3.0",
            typescript: "^5.5.3",
            vite: "^5.4.0",
            tailwindcss: "^3.4.1",
            autoprefixer: "^10.4.18",
            postcss: "^8.4.35"
          }
        };

        const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})`;

        const tsConfig = {
          compilerOptions: {
            target: "ES2020",
            useDefineForClassFields: true,
            lib: ["ES2020", "DOM", "DOM.Iterable"],
            module: "ESNext",
            skipLibCheck: true,
            moduleResolution: "bundler",
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: "react-jsx",
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true
          },
          include: ["src"]
        };

        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

        const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

        const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

        const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

        const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

        const appTsx = `import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ${projectName}
        </h1>
        <p className="text-gray-600 mb-6">
          ${description}
        </p>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Planned Features:</h2>
          <ul className="space-y-1">
            ${features.map((f) => `<li className="text-gray-600">• ${f}</li>`).join("\n            ")}
          </ul>
        </div>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            🎉 Your React app scaffold is ready! Ask me to add features and components.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App`;

        // Write all configuration files
        await sandbox.filesystem.write(
          "package.json",
          JSON.stringify(packageJson, null, 2)
        );
        await sandbox.filesystem.write("vite.config.ts", viteConfig);
        await sandbox.filesystem.write(
          "tsconfig.json",
          JSON.stringify(tsConfig, null, 2)
        );
        await sandbox.filesystem.write("tailwind.config.js", tailwindConfig);
        await sandbox.filesystem.write("postcss.config.js", postcssConfig);
        await sandbox.filesystem.write("index.html", indexHtml);

        // Create src directory and files
        await sandbox.filesystem.makeDir("src", { recursive: true });
        await sandbox.filesystem.write("src/main.tsx", mainTsx);
        await sandbox.filesystem.write("src/App.tsx", appTsx);
        await sandbox.filesystem.write("src/index.css", indexCss);

        // Install dependencies
        const installProc = await sandbox.process.start("npm install");
        await installProc.wait;

        // Start dev server in background
        const devServerProc = await sandbox.process.start("npm run dev");

        return JSON.stringify({
          success: true,
          phase: "PHASE 1: Project Scaffold Complete",
          sandboxId: sandbox.id,
          sandboxUrl: sandbox.getHostname(),
          projectName,
          description,
          features,
          processId: devServerProc.pid,
          message: `✅ React app created successfully! Development server is starting. Next, I can help you build out the features: ${features.join(
            ", "
          )}`,
          files: {
            "package.json": packageJson,
            "src/App.tsx": appTsx,
            "src/main.tsx": mainTsx,
            "index.html": indexHtml
          },
          nextSteps: [
            "Add React components for each feature",
            "Implement state management",
            "Add routing if needed",
            "Style components with Tailwind"
          ]
        });
      } catch (error) {
        return `Error creating React app: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }
  }),
  getWeatherInformation,
  getLocalTime,
  scheduleTask,
  addComponent: tool({
    description:
      "Adds or updates a component in the application. Use this for PHASE 2-3: Building features and components. Can create functional components with hooks, state management, and TypeScript types.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      componentName: z
        .string()
        .describe(
          "Name of the component (e.g., 'TodoList', 'Header', 'LoginForm')"
        ),
      componentCode: z
        .string()
        .describe("Complete component code with TypeScript"),
      filePath: z
        .string()
        .describe("The path to the component file (e.g., 'src/components/TodoList.tsx')"),
      imports: z
        .array(z.string())
        .optional()
        .describe(
          "Additional dependencies to install (e.g., ['@heroicons/react', 'framer-motion'])"
        ),
      updateApp: z
        .boolean()
        .optional()
        .describe("Whether to update App.tsx to use this component")
    }),
    execute: async ({
      sandboxId,
      componentName,
      componentCode,
      imports,
      updateApp
    }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);

        // Install additional dependencies if needed
        if (imports && imports.length > 0) {
          const installProc = await sandbox.process.start(
            `npm install ${imports.join(" ")}`
          );
          await installProc.wait;
        }

        // Create components directory if it doesn't exist
        await sandbox.filesystem.makeDir("src/components").catch(() => {
          /* ignore if exists */
        });

        // Write component file
        const componentPath = `src/components/${componentName}.tsx`;
        await sandbox.filesystem.write(componentPath, componentCode);

        // Update App.tsx if requested
        if (updateApp) {
          const appContent = await sandbox.filesystem.read("src/App.tsx");
          const importLine = `import ${componentName} from './components/${componentName}'`;
          const updatedApp = `${importLine}\n${appContent}`;
          await sandbox.filesystem.write("src/App.tsx", updatedApp);
        }

        return JSON.stringify({
          success: true,
          phase: "PHASE 2-3: Feature Development",
          componentName,
          componentPath,
          message: `✅ Component ${componentName} added successfully! ${
            imports ? `Installed: ${imports.join(", ")}` : ""
          }`,
          nextSteps: [
            "Test the component",
            "Add more features",
            "Refine styling and UX",
            "Add error handling and edge cases"
          ]
        });
      } catch (error) {
        return `Error adding component: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }
  }),

  updateFile: tool({
    description:
      "Updates any file in the web application. Use this for iterative refinement and modifications. Can update components, add new features, fix bugs, or improve styling.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      filePath: z
        .string()
        .describe(
          "Path to the file to update (e.g., 'src/App.tsx', 'src/components/Header.tsx')"
        ),
      content: z.string().describe("The new content for the file")
    }),
    execute: async ({ sandboxId, filePath, content }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        await sandbox.filesystem.write(filePath, content);

        return JSON.stringify({
          success: true,
          phase: "Iterative Refinement",
          filePath,
          message: `✅ Updated ${filePath} successfully! The dev server will hot-reload automatically.`,
          nextSteps: [
            "Review the changes in the preview",
            "Continue refining",
            "Add more features",
            "Prepare for production build"
          ]
        });
      } catch (error) {
        return `Error updating file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }
  }),

  buildApp: tool({
    description:
      "Builds the web application for production. Use this for PHASE 4: Production build and optimization. Creates optimized, minified bundles ready for deployment.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app")
    }),
    execute: async ({ sandboxId }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const buildProc = await sandbox.process.start("npm run build");
        const { stdout, stderr } = await buildProc.wait;

        if (stderr) {
          return `Build failed: ${stderr}`;
        }

        const distFiles = await sandbox.filesystem.list("dist");

        return JSON.stringify({
          success: true,
          phase: "PHASE 4: Production Build Complete",
          message:
            "✅ Production build successful! Your app is optimized and ready to deploy.",
          buildOutput: stdout,
          distFiles: distFiles.map((f) => f.path) || [],
          nextSteps: [
            "Deploy to Cloudflare Pages",
            "Deploy to Vercel or Netlify",
            "Share the preview URL",
            "Set up custom domain"
          ]
        });
      } catch (error) {
        return `Error building app: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }
  }),

  readFile: tool({
    description:
      "Reads any file from the web application. Use this to review existing code before making changes or to understand the current state of the app.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      filePath: z
        .string()
        .describe("Path to the file to read (e.g., 'src/App.tsx')")
    }),
    execute: async ({ sandboxId, filePath }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const content = await sandbox.filesystem.read(filePath);
        return content;
      } catch (error) {
        return `Error reading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }
  }),

  createDatabase: tool({
    description: "Creates a new database in the sandbox.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      dbName: z.string().describe("The name of the database to create"),
    }),
    execute: async ({ sandboxId, dbName }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const { stdout, stderr } = await sandbox.process.startAndWait(
          `createdb ${dbName}`
        );

        if (stderr) {
          return `Error creating database: ${stderr}`;
        }

        return `Database ${dbName} created successfully.`;
      } catch (error) {
        return `Error creating database: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  }),
  gitCommit: tool({
    description: "Commits changes to the git repository.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      commitMessage: z.string().describe("The commit message"),
    }),
    execute: async ({ sandboxId, commitMessage }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const { stdout, stderr } = await sandbox.process.startAndWait(
          `git commit -m "${commitMessage}"`
        );

        if (stderr) {
          return `Error committing changes: ${stderr}`;
        }

        return `Changes committed successfully.`;
      } catch (error) {
        return `Error committing changes: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  }),
  gitPush: tool({
    description: "Pushes changes to a remote git repository.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      remote: z.string().describe("The remote to push to"),
      branch: z.string().describe("The branch to push"),
    }),
    execute: async ({ sandboxId, remote, branch }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const { stdout, stderr } = await sandbox.process.startAndWait(
          `git push ${remote} ${branch}`
        );

        if (stderr) {
          return `Error pushing changes: ${stderr}`;
        }

        return `Changes pushed successfully.`;
      } catch (error) {
        return `Error pushing changes: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  }),
  gitInit: tool({
    description: "Initializes a git repository in the sandbox.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
    }),
    execute: async ({ sandboxId }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const { stdout, stderr } = await sandbox.process.startAndWait(
          "git init"
        );

        if (stderr) {
          return `Error initializing git repository: ${stderr}`;
        }

        return `Git repository initialized successfully.`;
      } catch (error) {
        return `Error initializing git repository: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  }),
  deployApp: tool({
    description: "Deploys the web application.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      deployCommand: z.string().describe("The command to deploy the app"),
    }),
    execute: async ({ sandboxId, deployCommand }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const { stdout, stderr } = await sandbox.process.startAndWait(
          deployCommand
        );

        if (stderr) {
          return `Deployment failed: ${stderr}`;
        }

        return `Deployment successful: ${stdout}`;
      } catch (error) {
        return `Error deploying app: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  }),
  runTests: tool({
    description: "Runs tests in the sandbox.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      testCommand: z.string().describe("The command to run tests"),
    }),
    execute: async ({ sandboxId, testCommand }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const { stdout, stderr } = await sandbox.process.startAndWait(
          testCommand
        );

        if (stderr) {
          return `Tests failed: ${stderr}`;
        }

        return `Tests passed: ${stdout}`;
      } catch (error) {
        return `Error running tests: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  }),
  installPackages: tool({
    description:
      "Installs npm packages in the web application. Use this to add new libraries, UI frameworks, state management tools, or any other dependencies.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the web app"),
      packages: z
        .array(z.string())
        .describe(
          "Array of npm packages to install (e.g., ['zustand', 'react-router-dom', '@radix-ui/react-dialog'])"
        )
    }),
    execute: async ({ sandboxId, packages }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = await Sandbox.reconnect(sandboxId);
        const installProc = await sandbox.process.start(
          `npm install ${packages.join(" ")}`
        );
        const { stderr } = await installProc.wait;

        if (stderr) {
          return `Installation failed: ${stderr}`;
        }

        return JSON.stringify({
          success: true,
          packages,
          message: `✅ Installed packages: ${packages.join(
            ", "
          )}. You can now import and use them in your components!`
        });
      } catch (error) {
        return `Error installing packages: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }
  }),
  getScheduledTasks,
  cancelScheduledTask
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  }
};
