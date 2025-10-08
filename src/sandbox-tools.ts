import { tool } from "ai";
import { z } from "zod";
import { getCurrentAgent } from "agents";
import { getSandbox } from "@cloudflare/sandbox";
import type { Chat } from "./server";
import type { ToolSet } from "ai";

/**
 * React Web App Builder Tools using Cloudflare Sandbox
 * Builds production-ready React applications with Vite in phases
 */

// Helper type for accessing Sandbox binding
type ChatWithSandbox = Chat & { env: Env & { Sandbox: DurableObjectNamespace } };

function getAgentWithSandbox(): ChatWithSandbox | null {
  const ctx = getCurrentAgent<Chat>();
  if (!ctx?.agent) return null;
  return ctx.agent as ChatWithSandbox;
}

export const webAppTools = {
  createReactApp: tool({
    description:
      "Creates a new production-ready React application with Vite, TypeScript, and Tailwind CSS. Use this when the user wants to build a new web app. This is PHASE 1: Initial scaffold and project setup.",
    inputSchema: z.object({
      projectName: z
        .string()
        .describe("Name of the project (e.g., 'todo-app', 'portfolio')"),
      description: z.string().describe("Description of what the app should do"),
      features: z
        .array(z.string())
        .describe(
          "List of features to implement (e.g., ['dark mode', 'authentication', 'responsive design'])"
        )
    }),
    execute: async ({ projectName, description, features }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandboxId = `react-${projectName}-${Date.now()}`;
        const sandbox = getSandbox(agent.env.Sandbox, sandboxId);

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
        await sandbox.writeFile(
          "package.json",
          JSON.stringify(packageJson, null, 2)
        );
        await sandbox.writeFile("vite.config.ts", viteConfig);
        await sandbox.writeFile(
          "tsconfig.json",
          JSON.stringify(tsConfig, null, 2)
        );
        await sandbox.writeFile("tailwind.config.js", tailwindConfig);
        await sandbox.writeFile("postcss.config.js", postcssConfig);
        await sandbox.writeFile("index.html", indexHtml);

        // Create src directory and files
        await sandbox.mkdir("src", { recursive: true });
        await sandbox.writeFile("src/main.tsx", mainTsx);
        await sandbox.writeFile("src/App.tsx", appTsx);
        await sandbox.writeFile("src/index.css", indexCss);

        // Install dependencies
        const installResult = await sandbox.exec("npm install");
        if (!installResult.success) {
          return `Error installing dependencies: ${installResult.stderr}`;
        }

        // Start dev server in background
        const devServer = await sandbox.startProcess("npm run dev", {
          processId: `${sandboxId}-dev`
        });

        return JSON.stringify({
          success: true,
          phase: "PHASE 1: Project Scaffold Complete",
          sandboxId,
          projectName,
          description,
          features,
          processId: devServer.id,
          message: `✅ React app created successfully! Development server is starting. Next, I can help you build out the features: ${features.join(", ")}`,
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
        return `Error creating React app: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  }),

  addReactComponent: tool({
    description:
      "Adds or updates a React component in the application. Use this for PHASE 2-3: Building features and components. Can create functional components with hooks, state management, and TypeScript types.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the React app"),
      componentName: z
        .string()
        .describe(
          "Name of the component (e.g., 'TodoList', 'Header', 'LoginForm')"
        ),
      componentCode: z
        .string()
        .describe("Complete React component code with TypeScript"),
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
        const sandbox = getSandbox(agent.env.Sandbox, sandboxId);

        // Install additional dependencies if needed
        if (imports && imports.length > 0) {
          const installResult = await sandbox.exec(
            `npm install ${imports.join(" ")}`
          );
          if (!installResult.success) {
            return `Error installing dependencies: ${installResult.stderr}`;
          }
        }

        // Create components directory if it doesn't exist
        await sandbox.mkdir("src/components").catch(() => {
          /* ignore if exists */
        });

        // Write component file
        const componentPath = `src/components/${componentName}.tsx`;
        await sandbox.writeFile(componentPath, componentCode);

        // Update App.tsx if requested
        if (updateApp) {
          const appResponse = await sandbox.readFile("src/App.tsx");
          const importLine = `import ${componentName} from './components/${componentName}'`;
          const updatedApp = `${importLine}\n${appResponse.content}`;
          await sandbox.writeFile("src/App.tsx", updatedApp);
        }

        return JSON.stringify({
          success: true,
          phase: "PHASE 2-3: Feature Development",
          componentName,
          componentPath,
          message: `✅ Component ${componentName} added successfully! ${imports ? `Installed: ${imports.join(", ")}` : ""}`,
          nextSteps: [
            "Test the component",
            "Add more features",
            "Refine styling and UX",
            "Add error handling and edge cases"
          ]
        });
      } catch (error) {
        return `Error adding component: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  }),

  updateReactFile: tool({
    description:
      "Updates any file in the React application. Use this for iterative refinement and modifications. Can update components, add new features, fix bugs, or improve styling.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the React app"),
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
        const sandbox = getSandbox(agent.env.Sandbox, sandboxId);
        await sandbox.writeFile(filePath, content);

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
        return `Error updating file: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  }),

  buildReactApp: tool({
    description:
      "Builds the React application for production. Use this for PHASE 4: Production build and optimization. Creates optimized, minified bundles ready for deployment.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the React app")
    }),
    execute: async ({ sandboxId }) => {
      const agent = getAgentWithSandbox();
      if (!agent) {
        return "Agent context not available";
      }

      try {
        const sandbox = getSandbox(agent.env.Sandbox, sandboxId);
        const buildResult = await sandbox.exec("npm run build");

        if (buildResult.success) {
          const distFiles = await sandbox.listFiles("dist");

          return JSON.stringify({
            success: true,
            phase: "PHASE 4: Production Build Complete",
            message:
              "✅ Production build successful! Your app is optimized and ready to deploy.",
            buildOutput: buildResult.stdout,
            distFiles: distFiles.files?.map((f) => f.relativePath) || [],
            nextSteps: [
              "Deploy to Cloudflare Pages",
              "Deploy to Vercel or Netlify",
              "Share the preview URL",
              "Set up custom domain"
            ]
          });
        } else {
          return `Build failed: ${buildResult.stderr}`;
        }
      } catch (error) {
        return `Error building app: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  }),

  readReactFile: tool({
    description:
      "Reads any file from the React application. Use this to review existing code before making changes or to understand the current state of the app.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the React app"),
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
        const sandbox = getSandbox(agent.env.Sandbox, sandboxId);
        const response = await sandbox.readFile(filePath);
        return response.content;
      } catch (error) {
        return `Error reading file: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  }),

  installPackages: tool({
    description:
      "Installs npm packages in the React application. Use this to add new libraries, UI frameworks, state management tools, or any other dependencies.",
    inputSchema: z.object({
      sandboxId: z.string().describe("The sandbox ID of the React app"),
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
        const sandbox = getSandbox(agent.env.Sandbox, sandboxId);
        const installResult = await sandbox.exec(
          `npm install ${packages.join(" ")}`
        );

        if (installResult.success) {
          return JSON.stringify({
            success: true,
            packages,
            message: `✅ Installed packages: ${packages.join(", ")}. You can now import and use them in your components!`
          });
        } else {
          return `Installation failed: ${installResult.stderr}`;
        }
      } catch (error) {
        return `Error installing packages: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
  })
} satisfies ToolSet;
