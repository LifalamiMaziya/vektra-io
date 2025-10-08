import React from "react";
import { View, User } from "../types";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface PricingPageProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
  onAuthRequestWithRedirect: (view: View, section: string) => void;
}

const PricingCard = ({
  plan,
  price,
  features,
  recommended,
  onGetStarted
}: {
  plan: string;
  price: string;
  features: string[];
  recommended?: boolean;
  onGetStarted: () => void;
}) => (
  <div
    className={`border rounded-2xl p-8 transition-all duration-300 reveal-on-scroll opacity-0 translate-y-[30px] relative ${recommended ? "bg-white border-2 border-[#C87550] shadow-2xl lg:scale-105" : "bg-white/50 border-[#E0E0E0] hover:bg-white"}`}
  >
    {recommended && (
      <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#C87550] text-white text-xs font-bold px-3 py-1 rounded-full">
        RECOMMENDED
      </span>
    )}
    <h3 className="text-2xl font-bold text-[#212121]">{plan}</h3>
    <p className="mt-4 text-[#212121]">
      <span className="text-4xl font-bold">{price}</span>
      {plan !== "Enterprise" && (
        <span className="text-lg font-medium text-[#555555]">/mo</span>
      )}
    </p>
    <ul className="mt-6 space-y-3 text-[#555555]">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3">
          <i className="fas fa-check-circle text-[#5E837D]"></i>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onGetStarted}
      className={`w-full mt-8 py-3 rounded-lg font-semibold transition-colors ${recommended ? "bg-[#212121] text-white hover:bg-[#333]" : "bg-[#E0E0E0] text-[#212121] hover:bg-black/10"}`}
    >
      Get Started
    </button>
  </div>
);

const PricingPage: React.FC<PricingPageProps> = ({
  onNavigate,
  user,
  onLogout,
  onAuthRequestWithRedirect
}) => {
  const scrollRef = useScrollReveal();

  const handleGetStarted = () => {
    if (user) {
      onNavigate(View.AccountSettings, "billing");
    } else {
      onAuthRequestWithRedirect(View.AccountSettings, "billing");
    }
  };

  return (
    <div
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className="text-[#212121] relative min-h-screen flex flex-col px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C87550] opacity-30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#5E837D] opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <Header
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
        activeView={View.Pricing}
      />

      <main className="flex-grow">
        <section id="pricing" className="py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-[#212121] reveal-on-scroll opacity-0 translate-y-[30px]">
              Choose a Plan That's Right for You
            </h1>
            <p
              className="mt-4 text-lg text-[#555555] reveal-on-scroll opacity-0 translate-y-[30px]"
              style={{ transitionDelay: "0.1s" }}
            >
              Start for free, and scale up as you grow. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
            <PricingCard
              plan="Hobby"
              price="$0"
              features={[
                "3 Projects",
                "Community Support",
                "Vektraio Branding"
              ]}
              onGetStarted={handleGetStarted}
            />
            <PricingCard
              plan="Pro"
              price="$29"
              features={[
                "Unlimited Projects",
                "Priority Support",
                "No Branding",
                "Custom Domains"
              ]}
              recommended
              onGetStarted={handleGetStarted}
            />
            <PricingCard
              plan="Enterprise"
              price="Contact Us"
              features={[
                "Team Collaboration",
                "Advanced Security",
                "Dedicated Support",
                "API Access"
              ]}
              onGetStarted={handleGetStarted}
            />
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PricingPage;
