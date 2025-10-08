export interface FileAttachment {
  name: string;
  mimeType: string;
  data: string; // base64 encoded
}

export interface ChatMessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: "user" | "model";
  parts: ChatMessagePart[];
  versionIndex?: number;
}

export interface User {
  email: string;
  name?: string;
  avatar?: string;
  projects: Project[];
}

export interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  envVars: EnvironmentVariable[];
  versions: string[];
  chatHistory: ChatMessage[];
  currentVersionIndex: number;
}

export interface AppState {
  currentUserEmail: string | null;
  users: Record<string, User>;
}

export enum View {
  Landing,
  Workspace,
  Pricing,
  Docs,
  Updates,
  Showcase,
  Forum,
  Experts,
  About,
  Careers,
  Contact,
  Privacy,
  Terms,
  Dashboard,
  Login,
  SignUp,
  AccountSettings
}
