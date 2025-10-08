import React from "react";
import { View, User } from "../types";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface ContactPageProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({
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
            Contact Us
          </h1>
          <p
            className="mt-4 text-lg text-[#555555] reveal-on-scroll opacity-0 translate-y-[30px]"
            style={{ transitionDelay: "0.1s" }}
          >
            We'd love to hear from you. Reach out for support, sales, or just to
            say hello.
          </p>
        </div>
        <div
          className="mt-16 max-w-lg mx-auto text-center reveal-on-scroll opacity-0 translate-y-[30px]"
          style={{ transitionDelay: "0.2s" }}
        >
          <p className="text-lg text-[#555555]">
            For all inquiries, please email us at:
          </p>
          <a
            href="mailto:hello@vektra.io"
            className="text-2xl font-semibold text-[#C87550] hover:underline mt-2 inline-block"
          >
            hello@vektra.io
          </a>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ContactPage;
