import React from "react";
import { View, User } from "../types";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface DocsPageProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
}

const DocsPage: React.FC<DocsPageProps> = ({ onNavigate, user, onLogout }) => {
  const scrollRef = useScrollReveal();

  return (
    <div
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className="text-[#212121] relative min-h-screen flex flex-col px-6 md:px-12"
    >
      <Header
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
        activeView={View.Docs}
      />

      <main className="flex-grow py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#212121] reveal-on-scroll opacity-0 translate-y-[30px]">
            Vektraio Documentation
          </h1>
          <p
            className="mt-4 text-lg text-[#555555] reveal-on-scroll opacity-0 translate-y-[30px]"
            style={{ transitionDelay: "0.1s" }}
          >
            Your comprehensive guide to building amazing applications with AI.
          </p>
        </div>

        <div className="mt-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside
            className="md:col-span-1 reveal-on-scroll opacity-0 translate-y-[30px]"
            style={{ transitionDelay: "0.2s" }}
          >
            <h3 className="font-semibold text-lg mb-4">Getting Started</h3>
            <ul className="space-y-3 text-[#555555]">
              <li>
                <a href="#" className="font-semibold text-[#C87550]">
                  Introduction
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#212121]">
                  Your First Project
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#212121]">
                  The Workspace
                </a>
              </li>
            </ul>
            <h3 className="font-semibold text-lg mt-8 mb-4">Core Concepts</h3>
            <ul className="space-y-3 text-[#555555]">
              <li>
                <a href="#" className="hover:text-[#212121]">
                  Prompting 101
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#212121]">
                  Uploading Assets
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#212121]">
                  Version History
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#212121]">
                  Customizing Code
                </a>
              </li>
            </ul>
          </aside>

          {/* Main Content */}
          <div
            className="md:col-span-3 space-y-8 reveal-on-scroll opacity-0 translate-y-[30px]"
            style={{ transitionDelay: "0.3s" }}
          >
            <article className="prose lg:prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-[#212121]">
                Introduction
              </h2>
              <p className="mt-4 text-[#555555]">
                Welcome to Vektraio, the AI-native platform designed to
                revolutionize how you create web experiences. Our goal is to
                bridge the gap between idea and implementation, allowing you to
                build, iterate, and deploy faster than ever before.
              </p>
              <p className="mt-4 text-[#555555]">
                This documentation will guide you through the process of
                creating your first project, understanding the core concepts of
                AI-driven development, and mastering the tools available in your
                workspace.
              </p>

              <h3 className="text-2xl font-bold text-[#212121] mt-8">
                How It Works
              </h3>
              <p className="mt-4 text-[#555555]">
                Vektraio uses a powerful generative model fine-tuned for
                frontend development. When you provide a prompt, the AI
                interprets your request and generates a complete, single-file
                HTML application using Tailwind CSS. You can then refine this
                output through a conversational chat interface, making changes
                as easily as describing them.
              </p>

              <div className="mt-8 p-6 bg-white/50 border border-[#E0E0E0] rounded-2xl">
                <h4 className="font-bold text-[#212121]">Key Principles</h4>
                <ul className="mt-4 space-y-3 text-[#555555] list-disc list-inside">
                  <li>
                    <strong>Prompt-First Development:</strong> Start with a
                    clear description of what you want to build. The more
                    detailed your initial prompt, the better the result.
                  </li>
                  <li>
                    <strong>Iterative Refinement:</strong> Use the chat
                    interface to make changes. Treat the AI as your development
                    partner.
                  </li>
                  <li>
                    <strong>Full Ownership:</strong> The generated code is
                    yours. You can download it at any time and host it anywhere
                    you like.
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default DocsPage;
