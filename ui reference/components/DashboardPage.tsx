import React from "react";
import { View, User, Project } from "../types";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { ProjectCard } from "./ProjectCard";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface DashboardPageProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onStartNewProject: () => void;
}

const NewProjectCard = ({
  onClick,
  delay
}: {
  onClick: () => void;
  delay?: string;
}) => (
  <button
    onClick={onClick}
    className="project-card bg-white/50 border-2 border-dashed border-[#D0D0D0] rounded-2xl transition-all duration-300 ease-out hover:border-[#C87550] hover:bg-white reveal-on-scroll opacity-0 translate-y-[30px] flex items-center justify-center text-[#555555] hover:text-[#212121] h-full"
    style={{ transitionDelay: delay }}
  >
    <div className="text-center">
      <i className="fas fa-plus text-4xl"></i>
      <h3 className="font-semibold mt-4">Start New Project</h3>
    </div>
  </button>
);

const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  user,
  onLogout,
  projects,
  onSelectProject,
  onStartNewProject
}) => {
  const scrollRef = useScrollReveal();

  return (
    <div
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className="text-[#212121] relative min-h-screen flex flex-col px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C87550] opacity-30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#5E837D] opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />

      <main className="flex-grow py-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#212121] reveal-on-scroll opacity-0 translate-y-[30px]">
            My Workspace
          </h1>
          <p
            className="mt-4 text-lg text-[#555555] reveal-on-scroll opacity-0 translate-y-[30px]"
            style={{ transitionDelay: "0.1s" }}
          >
            All your projects in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 max-w-7xl mx-auto">
          <NewProjectCard onClick={onStartNewProject} />
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              imgSrc={`https://picsum.photos/seed/${project.id}/600/400`}
              title={project.name}
              delay={`${(index + 1) * 0.05}s`}
              onClick={() => onSelectProject(project.id)}
            />
          ))}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default DashboardPage;
