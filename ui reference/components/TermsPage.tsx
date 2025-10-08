import React from "react";
import { View, User } from "../types";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface TermsPageProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#212121] reveal-on-scroll opacity-0 translate-y-[30px]">
            Terms of Use
          </h1>
          <p
            className="mt-4 text-lg text-[#555555] reveal-on-scroll opacity-0 translate-y-[30px]"
            style={{ transitionDelay: "0.1s" }}
          >
            Last Updated: July 26, 2024
          </p>
        </div>
        <div
          className="mt-12 max-w-4xl mx-auto space-y-6 text-[#555555] text-left prose lg:prose-lg reveal-on-scroll opacity-0 translate-y-[30px]"
          style={{ transitionDelay: "0.2s" }}
        >
          <p>
            This is a placeholder for your terms of use. This agreement sets the
            rules and guidelines that users must agree to in order to use your
            service. It's a critical legal document for protecting your company.
          </p>
          <h2 className="text-2xl font-bold text-[#212121]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Vektraio, you accept and agree to be bound by
            the terms and provision of this agreement. If you do not agree to
            abide by the above, please do not use this service.
          </p>
          <h2 className="text-2xl font-bold text-[#212121]">2. User Conduct</h2>
          <p>
            You agree not to use the service for any unlawful purpose or any
            purpose prohibited under this clause. You agree not to use the
            service in any way that could damage the service, services, or
            general business of Vektraio.
          </p>
          <h2 className="text-2xl font-bold text-[#212121]">
            3. Intellectual Property
          </h2>
          <p>
            The Service and its original content, features, and functionality
            are and will remain the exclusive property of Vektraio and its
            licensors. The code you generate is your own to use, but the
            platform itself is our property.
          </p>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default TermsPage;
