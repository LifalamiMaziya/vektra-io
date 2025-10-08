import React from "react";
import { View, User } from "../types";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AboutPageProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  user,
  onLogout
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
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#212121] reveal-on-scroll opacity-0 translate-y-[30px]">
            About Us
          </h1>
          <p
            className="mt-4 text-lg text-[#555555] reveal-on-scroll opacity-0 translate-y-[30px]"
            style={{ transitionDelay: "0.1s" }}
          >
            We're on a mission to make web development accessible to everyone
            through the power of AI.
          </p>
        </div>
        <div
          className="mt-16 max-w-4xl mx-auto space-y-6 text-lg text-[#555555] text-left reveal-on-scroll opacity-0 translate-y-[30px]"
          style={{ transitionDelay: "0.2s" }}
        >
          <p>
            Vektraio was founded on a simple principle: creating for the web
            should be as easy as describing an idea. We believe that artificial
            intelligence is the key to unlocking a new era of creativity,
            allowing designers, entrepreneurs, and developers to build
            beautiful, functional websites and applications faster than ever
            before.
          </p>
          <p>
            Our team is composed of passionate engineers, designers, and AI
            researchers dedicated to pushing the boundaries of what's possible.
            We are building a platform that not only generates code but acts as
            a creative partner, helping you iterate and refine your vision in
            real-time.
          </p>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default AboutPage;
