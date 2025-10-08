import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import WorkspacePage from "./components/WorkspacePage";
import PricingPage from "./components/PricingPage";
import DocsPage from "./components/DocsPage";
import UpdatesPage from "./components/UpdatesPage";
import ShowcasePage from "./components/ShowcasePage";
import ForumPage from "./components/ForumPage";
import ExpertsPage from "./components/ExpertsPage";
import AboutPage from "./components/AboutPage";
import CareersPage from "./components/CareersPage";
import ContactPage from "./components/ContactPage";
import PrivacyPage from "./components/PrivacyPage";
import TermsPage from "./components/TermsPage";
import DashboardPage from "./components/DashboardPage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import AccountSettingsPage from "./components/AccountSettingsPage";
import { View } from "./types";
import type { FileAttachment, User, AppState, Project } from "./types";
import { getAppState, saveAppState } from "./services/storageService";

// FIX: Added a global JSX type definition for the custom element 'interactive-abstract-bg' to resolve a TypeScript error.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "interactive-abstract-bg": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(getAppState());
  const [view, setView] = useState<View>(View.Landing);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [initialAnchor, setInitialAnchor] = useState<string | null>(null);
  const [postAuthRedirect, setPostAuthRedirect] = useState<{
    view: View;
    section: string;
  } | null>(null);
  const [initialAccountSettingsSection, setInitialAccountSettingsSection] =
    useState<string | null>(null);
  const [focusPromptOnLanding, setFocusPromptOnLanding] =
    useState<boolean>(false);

  const user = appState.currentUserEmail
    ? appState.users[appState.currentUserEmail]
    : null;
  const activeProject =
    user?.projects.find((p) => p.id === activeProjectId) ?? null;

  useEffect(() => {
    // Persist state whenever it changes
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    // Only scroll to top if not targeting an anchor and not on the landing page.
    // This allows for normal browser scroll restoration on the landing page.
    if (!initialAnchor && view !== View.Landing) {
      window.scrollTo(0, 0);
    }
  }, [view, initialAnchor]);

  useEffect(() => {
    // Handle body background color based on the current view.
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
      // For demo purposes, create a user if they don't exist.
      handleSignUp(email, true);
      return;
    }
    updateUserState((prev) => ({ ...prev, currentUserEmail: email }));

    if (postAuthRedirect) {
      handleNavigate(postAuthRedirect.view, postAuthRedirect.section);
      setPostAuthRedirect(null);
    } else {
      setView(View.Dashboard);
    }
  };

  // Fix: Per coding guidelines, removed usage of alert(). If a user tries to sign up with an existing email, they will be logged in.
  const handleSignUp = (email: string, isFromLogin = false) => {
    if (appState.users[email]) {
      // User already exists, log them in directly.
      handleLogin(email);
      return;
    }
    const newUser: User = {
      email,
      name: "New User",
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      projects: []
    };
    updateUserState((prev) => ({
      ...prev,
      users: { ...prev.users, [email]: newUser },
      currentUserEmail: email
    }));

    if (postAuthRedirect) {
      handleNavigate(postAuthRedirect.view, postAuthRedirect.section);
      setPostAuthRedirect(null);
    } else {
      setView(View.Dashboard);
    }
  };

  const handleLogout = () => {
    updateUserState((prev) => ({ ...prev, currentUserEmail: null }));
    setActiveProjectId(null);
    setView(View.Landing);
  };

  const handleUpdateUser = (
    updatedUserData: Partial<Omit<User, "projects">>
  ) => {
    if (user) {
      updateUserState((prev) => {
        const updatedUser = { ...prev.users[user.email], ...updatedUserData };
        return { ...prev, users: { ...prev.users, [user.email]: updatedUser } };
      });
    }
  };

  const handleStartNewProject = (prompt: string, files: FileAttachment[]) => {
    if (!user) {
      setView(View.Login);
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
      return { ...prev, users: { ...prev.users, [user.email]: updatedUser } };
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

  const handleNavigate = (targetView: View, context?: string) => {
    const protectedViews = [
      View.Dashboard,
      View.AccountSettings,
      View.Workspace
    ];
    if (protectedViews.includes(targetView) && !user) {
      setView(View.Login);
      return;
    }

    if (targetView === View.AccountSettings && context) {
      setInitialAccountSettingsSection(context);
    } else {
      setInitialAccountSettingsSection(null);
    }

    if (targetView === View.Landing && context === "focusPrompt") {
      setFocusPromptOnLanding(true);
    } else {
      setFocusPromptOnLanding(false);
    }

    if (targetView !== View.Workspace) {
      setActiveProjectId(null);
    }

    setView(targetView);
    setInitialAnchor(
      targetView === View.Landing && context && context !== "focusPrompt"
        ? context
        : null
    );
  };

  const handleAuthRequestWithRedirect = (targetView: View, section: string) => {
    setPostAuthRedirect({ view: targetView, section });
    setView(View.Login);
  };

  const handleAnchorHandled = () => {
    setInitialAnchor(null);
  };

  const handlePromptFocused = () => {
    setFocusPromptOnLanding(false);
  };

  const renderView = () => {
    const pageProps = {
      onNavigate: handleNavigate,
      user,
      onLogout: handleLogout
    };

    switch (view) {
      case View.Login:
        return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      case View.SignUp:
        return (
          <SignUpPage onSignUp={handleSignUp} onNavigate={handleNavigate} />
        );
      case View.Pricing:
        return (
          <PricingPage
            {...pageProps}
            onAuthRequestWithRedirect={handleAuthRequestWithRedirect}
          />
        );
      case View.Docs:
        return <DocsPage {...pageProps} />;
      case View.Updates:
        return <UpdatesPage {...pageProps} />;
      case View.Showcase:
        return <ShowcasePage {...pageProps} />;
      case View.Forum:
        return <ForumPage {...pageProps} />;
      case View.Experts:
        return <ExpertsPage {...pageProps} />;
      case View.About:
        return <AboutPage {...pageProps} />;
      case View.Careers:
        return <CareersPage {...pageProps} />;
      case View.Contact:
        return <ContactPage {...pageProps} />;
      case View.Privacy:
        return <PrivacyPage {...pageProps} />;
      case View.Terms:
        return <TermsPage {...pageProps} />;
      case View.Dashboard:
        if (!user)
          return (
            <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />
          );
        return (
          <DashboardPage
            {...pageProps}
            projects={user.projects}
            onSelectProject={handleSelectProject}
            onStartNewProject={() =>
              handleNavigate(View.Landing, "focusPrompt")
            }
          />
        );
      case View.AccountSettings:
        if (!user)
          return (
            <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />
          );
        return (
          <AccountSettingsPage
            {...pageProps}
            user={user}
            onUpdateUser={handleUpdateUser}
            initialSection={initialAccountSettingsSection}
          />
        );
      case View.Workspace:
        if (!user || !activeProject) {
          handleNavigate(View.Dashboard);
          return null; // or a loader
        }
        return (
          <WorkspacePage
            key={activeProject.id} // Re-mount component when project changes
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        );
      case View.Landing:
      default:
        return (
          <LandingPage
            onStartNewProject={handleStartNewProject}
            onNavigate={handleNavigate}
            initialAnchor={initialAnchor}
            onAnchorHandled={handleAnchorHandled}
            user={user}
            onLogout={handleLogout}
            projects={user?.projects || []}
            onSelectProject={handleSelectProject}
            focusOnPrompt={focusPromptOnLanding}
            onPromptFocused={handlePromptFocused}
          />
        );
    }
  };

  const isWorkspace = view === View.Workspace;

  return (
    <div>
      {!isWorkspace && (
        <interactive-abstract-bg
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -10
          }}
        />
      )}
      {renderView()}
    </div>
  );
};

export default App;
