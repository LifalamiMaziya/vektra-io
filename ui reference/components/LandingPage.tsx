import React, { useRef, useState, useEffect } from "react";
import type { FileAttachment, User, Project } from "../types";
import { View } from "../types";
import { useFileHandler } from "../hooks/useFileHandler";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { FilePill } from "./FilePill";
import { ProjectCard } from "./ProjectCard";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LandingPageProps {
  onStartNewProject: (prompt: string, files: FileAttachment[]) => void;
  onNavigate: (view: View, context?: string) => void;
  initialAnchor: string | null;
  onAnchorHandled: () => void;
  user: User | null;
  onLogout: () => void;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  focusOnPrompt?: boolean;
  onPromptFocused: () => void;
}

const CommunityCard = ({
  imgSrc,
  title,
  author,
  authorImg,
  delay
}: {
  imgSrc: string;
  title: string;
  author: string;
  authorImg: string;
  delay?: string;
}) => (
  <div
    className="project-card bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-lg shadow-black/5 hover:-translate-y-2 hover:border-[#C87550] hover:shadow-xl reveal-on-scroll opacity-0 translate-y-[30px]"
    style={{ transitionDelay: delay }}
  >
    <img
      src={imgSrc}
      alt="Project Thumbnail"
      className="aspect-[16/10] object-cover w-full"
    />
    <div className="p-4 flex items-center gap-3">
      <img src={authorImg} className="w-8 h-8 rounded-full" alt="avatar" />
      <div>
        <h3 className="font-semibold text-[#212121]">{title}</h3>
        <p className="text-sm text-[#555555]">by {author}</p>
      </div>
    </div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({
  onStartNewProject,
  onNavigate,
  initialAnchor,
  onAnchorHandled,
  user,
  onLogout,
  projects,
  onSelectProject,
  focusOnPrompt,
  onPromptFocused
}) => {
  const [prompt, setPrompt] = useState("");
  const { attachedFiles, handleFileChange, removeFile, clearFiles } =
    useFileHandler();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useScrollReveal();

  useEffect(() => {
    if (initialAnchor) {
      const element = document.getElementById(initialAnchor);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
      onAnchorHandled();
    }
  }, [initialAnchor, onAnchorHandled]);

  useEffect(() => {
    if (focusOnPrompt) {
      setTimeout(() => {
        // Just focus the input, don't scroll the page to it.
        // The page should load at the top naturally.
        promptInputRef.current?.focus();
      }, 100);
      onPromptFocused();
    }
  }, [focusOnPrompt, onPromptFocused]);

  const handleBuildClick = () => {
    if (!user) {
      onNavigate(View.Login);
      return;
    }
    onStartNewProject(prompt, attachedFiles);
    clearFiles();
  };

  const handleTryLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    text: string
  ) => {
    e.preventDefault();
    setPrompt(text);
  };

  const handleNavClick = (
    e: React.MouseEvent,
    view: View,
    context?: string
  ) => {
    e.preventDefault();
    onNavigate(view, context);
  };

  const displayedProjects = projects.slice(0, 4);

  return (
    <div
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className="text-[#212121] relative min-h-screen px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C87550] opacity-30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#5E837D] opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />

      <main className="text-center flex flex-col items-center justify-center min-h-[calc(100vh-76px)] pt-20 pb-16">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-[#212121] leading-tight animate-fadeInDown">
            Build something <span className="text-[#C87550]">lovable.</span>
          </h1>
          <p
            className="mt-6 text-lg md:text-xl text-[#555555] max-w-2xl mx-auto animate-fadeInDown"
            style={{ animationDelay: "0.2s" }}
          >
            Create professional websites and applications with an AI-powered
            prompt.
          </p>
        </div>

        <div
          className="mt-12 w-full max-w-2xl animate-fadeInUp"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="relative bg-white/80 backdrop-blur-sm border border-[#E0E0E0] rounded-2xl shadow-lg shadow-black/10">
            {attachedFiles.length > 0 && (
              <div className="p-3 border-b border-[#E0E0E0] scrollbar-hide overflow-x-auto whitespace-nowrap">
                {attachedFiles.map((file, index) => (
                  <FilePill
                    key={index}
                    fileName={file.name}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            )}
            <div className="relative flex items-center">
              <input
                ref={promptInputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuildClick()}
                placeholder="Ask Vektraio to create a website for..."
                className="w-full bg-transparent text-lg text-[#212121] placeholder-[#888888] py-4 pl-8 pr-32 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C87550]/50"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*,.txt,.md,.pdf"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#E0E0E0] w-10 h-10 rounded-full text-[#555] hover:text-[#212121]"
                >
                  <i className="fas fa-paperclip"></i>
                </button>
                <button
                  onClick={handleBuildClick}
                  className="bg-[#C87550] text-white font-semibold py-2.5 px-6 rounded-full hover:bg-opacity-90 transition-all"
                >
                  Build
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center items-center gap-3 text-sm text-[#555555]">
            <span>Try:</span>
            <a
              href="#"
              onClick={(e) =>
                handleTryLinkClick(e, "a personal portfolio website")
              }
              className="py-1 px-3 bg-[#E0E0E0] border border-[#D0D0D0] rounded-full hover:bg-[#D5D5D5]"
            >
              Portfolio
            </a>
            <a
              href="#"
              onClick={(e) =>
                handleTryLinkClick(e, "a dashboard for a SaaS product")
              }
              className="py-1 px-3 bg-[#E0E0E0] border border-[#D0D0D0] rounded-full hover:bg-[#D5D5D5]"
            >
              Dashboard
            </a>
            <a
              href="#"
              onClick={(e) =>
                handleTryLinkClick(e, "a landing page for a startup")
              }
              className="py-1 px-3 bg-[#E0E0E0] border border-[#D0D0D0] rounded-full hover:bg-[#D5D5D5]"
            >
              SaaS Landing Page
            </a>
          </div>
        </div>
      </main>

      {user && projects.length > 0 && (
        <section id="workspace" className="py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#212121] reveal-on-scroll opacity-0 translate-y-[30px]">
              Your Workspace
            </h2>
            <a
              href="#"
              onClick={(e) => handleNavClick(e, View.Dashboard)}
              className="text-[#555555] hover:text-[#212121] transition-colors reveal-on-scroll opacity-0 translate-y-[30px]"
            >
              View All &rarr;
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                title={project.name}
                imgSrc={`https://picsum.photos/seed/${project.id}/600/400`}
                delay={`${index * 0.1}s`}
                onClick={() => onSelectProject(project.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section id="community" className="py-24">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#212121] reveal-on-scroll opacity-0 translate-y-[30px]">
            From the Community
          </h2>
          <a
            href="#"
            onClick={(e) => handleNavClick(e, View.Showcase)}
            className="text-[#555555] hover:text-[#212121] transition-colors reveal-on-scroll opacity-0 translate-y-[30px]"
          >
            Show More &rarr;
          </a>
        </div>
        <div className="flex flex-wrap gap-3 mb-8 reveal-on-scroll opacity-0 translate-y-[30px]">
          <button className="py-2 px-5 rounded-full font-medium bg-[#212121] text-white border-2 border-transparent">
            All
          </button>
          <button className="py-2 px-5 rounded-full font-medium bg-transparent border-2 border-[#D0D0D0] hover:border-[#212121] transition">
            Ecommerce
          </button>
          <button className="py-2 px-5 rounded-full font-medium bg-transparent border-2 border-[#D0D0D0] hover:border-[#212121] transition">
            SaaS
          </button>
          <button className="py-2 px-5 rounded-full font-medium bg-transparent border-2 border-[#D0D0D0] hover:border-[#212121] transition">
            Website
          </button>
          <button className="py-2 px-5 rounded-full font-medium bg-transparent border-2 border-[#D0D0D0] hover:border-[#212121] transition">
            Personal
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CommunityCard
            imgSrc="https://picsum.photos/seed/fintech/600/400"
            title="Fintech Platform"
            author="@anna_dev"
            authorImg="https://i.pravatar.cc/40?u=a"
          />
          <CommunityCard
            imgSrc="https://picsum.photos/seed/ecoshop/600/400"
            title="Eco Friendly Store"
            author="@markus_g"
            authorImg="https://i.pravatar.cc/40?u=b"
            delay="0.1s"
          />
          <CommunityCard
            imgSrc="https://picsum.photos/seed/agency/600/400"
            title="Creative Agency Site"
            author="@jessica_ux"
            authorImg="https://i.pravatar.cc/40?u=c"
            delay="0.2s"
          />
          <CommunityCard
            imgSrc="https://picsum.photos/seed/recipe/600/400"
            title="Recipe Sharing App"
            author="@chef_carlos"
            authorImg="https://i.pravatar.cc/40?u=d"
            delay="0.05s"
          />
          <CommunityCard
            imgSrc="https://picsum.photos/seed/travel/600/400"
            title="Travel Planner"
            author="@sarah_travels"
            authorImg="https://i.pravatar.cc/40?u=e"
            delay="0.15s"
          />
          <CommunityCard
            imgSrc="https://picsum.photos/seed/podcast/600/400"
            title="Podcast Platform"
            author="@tech_talks"
            authorImg="https://i.pravatar.cc/40?u=f"
            delay="0.25s"
          />
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
