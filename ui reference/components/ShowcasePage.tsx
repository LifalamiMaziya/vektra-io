import React from "react";
import { View, User } from "../types";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface ShowcasePageProps {
  onNavigate: (view: View, context?: string) => void;
  user: User | null;
  onLogout: () => void;
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

const ShowcasePage: React.FC<ShowcasePageProps> = ({
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
            Community Showcase
          </h1>
          <p
            className="mt-4 text-lg text-[#555555] reveal-on-scroll opacity-0 translate-y-[30px]"
            style={{ transitionDelay: "0.1s" }}
          >
            Explore amazing projects built by the Vektraio community.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-3 mb-8 justify-center mt-12 reveal-on-scroll opacity-0 translate-y-[30px]"
          style={{ transitionDelay: "0.2s" }}
        >
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-7xl mx-auto">
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
          <CommunityCard
            imgSrc="https://picsum.photos/seed/fitness/600/400"
            title="Fitness Tracker"
            author="@fit_life"
            authorImg="https://i.pravatar.cc/40?u=g"
            delay="0.08s"
          />
          <CommunityCard
            imgSrc="https://picsum.photos/seed/music/600/400"
            title="Music Discovery App"
            author="@dj_vibes"
            authorImg="https://i.pravatar.cc/40?u=h"
            delay="0.18s"
          />
          <CommunityCard
            imgSrc="https://picsum.photos/seed/social/600/400"
            title="Social Networking Site"
            author="@connect_all"
            authorImg="https://i.pravatar.cc/40?u=i"
            delay="0.28s"
          />
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ShowcasePage;
