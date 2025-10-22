import type { View, User, Project } from "../../types";
import { Plus, Code } from "@phosphor-icons/react";

interface DashboardPageProps {
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onStartNewProject: () => void;
}

const DashboardPage = ({
  onNavigate,
  user,
  onLogout,
  projects,
  onSelectProject,
  onStartNewProject,
}: DashboardPageProps) => {
  return (
    <div className="bg-[#121212] text-white relative min-h-screen flex flex-col px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="py-6 flex justify-between items-center sticky top-0 backdrop-blur-sm z-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Code
            size={32}
            className="text-gray-400 cursor-pointer"
            onClick={() => onNavigate(View.Landing)}
          />
          <span className="text-2xl font-bold text-gray-200">Vektra</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.avatar || `https://i.pravatar.cc/150?u=${user.email}`
                  }
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-400 font-medium hidden sm:block">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-white font-medium transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-grow py-12 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-100">
            My Workspace
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            All your projects in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 max-w-7xl mx-auto">
          {/* New Project Card */}
          <button
            onClick={onStartNewProject}
            className="project-card bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-2xl transition-all duration-300 ease-out hover:border-gray-500 hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white h-64"
          >
            <div className="text-center">
              <Plus size={48} weight="bold" className="mx-auto mb-4" />
              <h3 className="font-semibold">Start New Project</h3>
            </div>
          </button>

          {/* Project Cards */}
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="project-card bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-lg shadow-black/20 hover:-translate-y-2 hover:border-gray-600 hover:shadow-xl h-64 flex flex-col"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                <Code size={64} className="text-gray-600 opacity-50" />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-200 text-left truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1 text-left">
                  {project.versions.length} version
                  {project.versions.length !== 1 ? "s" : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        <p>© 2025 Vektra AI. Powered by Cloudflare.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;
