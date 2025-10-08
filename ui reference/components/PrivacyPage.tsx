import React from "react";
import { View, User } from "../types";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface PrivacyPageProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({
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
            Privacy Policy
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
            This is a placeholder for your privacy policy. It's important to be
            transparent with your users about what data you collect, why you
            collect it, and how you use it. A comprehensive privacy policy
            builds trust and is often a legal requirement.
          </p>
          <h2 className="text-2xl font-bold text-[#212121]">
            Information We Collect
          </h2>
          <p>
            Detail the types of information you collect from users, such as
            personal identification information (name, email address),
            non-personal identification information (browser type, etc.), and
            any data submitted through the app.
          </p>
          <h2 className="text-2xl font-bold text-[#212121]">
            How We Use Collected Information
          </h2>
          <p>
            Explain the purposes for collecting data, such as to personalize
            user experience, to improve your service, to send periodic emails,
            etc.
          </p>
          <h2 className="text-2xl font-bold text-[#212121]">Your Consent</h2>
          <p>By using our site, you consent to our web site privacy policy.</p>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PrivacyPage;
