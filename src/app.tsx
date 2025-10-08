import { useState, useEffect } from "react";
import type {
  FileAttachment,
  User,
  AppState,
  Project,
  ProjectVersion,
  ProjectFile
} from "./types";
import { View } from "./types";
import { getAppState, saveAppState } from "./storage";
import WorkspacePage from "./components/workspace/WorkspacePage";
import LandingPage from "./components/landing/LandingPage";
import DashboardPage from "./components/dashboard/DashboardPage";

const App = () => {
  const [appState, setAppState] = useState<AppState>(getAppState());
  const [view, setView] = useState<View>(View.Landing);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const user = appState.currentUserEmail
    ? appState.users[appState.currentUserEmail]
    : null;
  const activeProject =
    user?.projects.find((p) => p.id === activeProjectId) ?? null;

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    if (!view || view === View.Landing) {
      window.scrollTo(0, 0);
    }
  }, [view]);

  useEffect(() => {
    if (view === View.Workspace) {
      document.body.style.backgroundColor = "#121212";
      document.body.classList.add("bg-[#121212]");
    } else {
      document.body.style.backgroundColor = "transparent";
      document.body.classList.remove("bg-[#121212]");
    }
  }, [view]);

  const updateUserState = (updater: (prevState: AppState) => AppState) => {
    setAppState(updater);
  };

  const handleLogin = (email: string) => {
    if (!appState.users[email]) {
      // Create demo user
      const newUser: User = {
        email,
        name: "Demo User",
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        projects: []
      };
      updateUserState((prev) => ({
        ...prev,
        users: { ...prev.users, [email]: newUser },
        currentUserEmail: email
      }));
    } else {
      updateUserState((prev) => ({ ...prev, currentUserEmail: email }));
    }
    setView(View.Dashboard);
  };

  const handleLogout = () => {
    updateUserState((prev) => ({ ...prev, currentUserEmail: null }));
    setActiveProjectId(null);
    setView(View.Landing);
  };

  const handleStartNewProject = (prompt: string, files: FileAttachment[]) => {
    if (!user) {
      // For demo, create a quick user
      const demoEmail = `demo${Date.now()}@vektra.io`;
      const newUser: User = {
        email: demoEmail,
        name: "Demo User",
        avatar: `https://i.pravatar.cc/150?u=${demoEmail}`,
        projects: []
      };

      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: prompt.substring(0, 30) || "New Project",
        description: "",
        envVars: [],
        versions: [],
        chatHistory: [
          {
            role: "user",
            parts: [
              ...(prompt ? [{ text: prompt }] : []),
              ...files.map((f) => ({
                inlineData: { mimeType: f.mimeType, data: f.data }
              }))
            ]
          }
        ],
        currentVersionIndex: -1
      };

      updateUserState((prev) => ({
        ...prev,
        users: {
          ...prev.users,
          [demoEmail]: { ...newUser, projects: [newProject] }
        },
        currentUserEmail: demoEmail
      }));

      setActiveProjectId(newProject.id);
      setView(View.Workspace);
      return;
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: prompt.substring(0, 30) || "New Project",
      description: "",
      envVars: [],
      versions: [],
      chatHistory: [
        {
          role: "user",
          parts: [
            ...(prompt ? [{ text: prompt }] : []),
            ...files.map((f) => ({
              inlineData: { mimeType: f.mimeType, data: f.data }
            }))
          ]
        }
      ],
      currentVersionIndex: -1
    };

    updateUserState((prev) => {
      const updatedUser = { ...user, projects: [...user.projects, newProject] };
      return {
        ...prev,
        users: { ...prev.users, [user.email]: updatedUser }
      };
    });

    setActiveProjectId(newProject.id);
    setView(View.Workspace);
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setView(View.Workspace);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    if (!user || !activeProject) return;
    updateUserState((prev) => {
      const updatedProjects = user.projects.map((p) =>
        p.id === updatedProject.id ? updatedProject : p
      );
      const updatedUser = { ...user, projects: updatedProjects };
      return { ...prev, users: { ...prev.users, [user.email]: updatedUser } };
    });
  };

  const handleDeleteProject = (projectId: string) => {
    if (!user) return;
    updateUserState((prev) => {
      const updatedProjects = user.projects.filter((p) => p.id !== projectId);
      const updatedUser = { ...user, projects: updatedProjects };
      return { ...prev, users: { ...prev.users, [user.email]: updatedUser } };
    });
    setActiveProjectId(null);
    setView(View.Dashboard);
  };

  const handleNavigate = (targetView: View) => {
    if (targetView !== View.Workspace) {
      setActiveProjectId(null);
    }
    setView(targetView);
  };

  const renderView = () => {
    switch (view) {
      case View.Dashboard:
        return (
          <DashboardPage
            user={user}
            projects={user?.projects || []}
            onSelectProject={handleSelectProject}
            onStartNewProject={() => handleNavigate(View.Landing)}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );

      case View.Workspace:
        if (!user || !activeProject) {
          handleNavigate(View.Dashboard);
          return null;
        }
        return (
          <WorkspacePage
            key={activeProject.id}
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );

      case View.Landing:
      default:
        return (
          <LandingPage
            onStartNewProject={handleStartNewProject}
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
            projects={user?.projects || []}
            onSelectProject={handleSelectProject}
          />
        );
    }
  };

  return <div>{renderView()}</div>;
};

export default App;
