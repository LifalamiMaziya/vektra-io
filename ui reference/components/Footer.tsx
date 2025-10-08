import React from "react";
import { View } from "../types";
import { TextLogo } from "./Icons";

interface FooterProps {
  onNavigate: (view: View, context?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavClick = (e: React.MouseEvent, view: View) => {
    e.preventDefault();
    onNavigate(view);
  };

  return (
    <footer className="py-16 border-t border-[#E0E0E0]">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <TextLogo height={24} />
          </div>
          <p className="mt-4 text-[#555555] max-w-xs">
            The AI-native platform for creating modern, professional web
            experiences.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-[#212121]">Product</h4>
          <ul className="mt-4 space-y-3 text-[#555555]">
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Pricing)}
                className="hover:text-[#212121]"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Updates)}
                className="hover:text-[#212121]"
              >
                Updates
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-[#212121]">Community</h4>
          <ul className="mt-4 space-y-3 text-[#555555]">
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Showcase)}
                className="hover:text-[#212121]"
              >
                Showcase
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Forum)}
                className="hover:text-[#212121]"
              >
                Forum
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Experts)}
                className="hover:text-[#212121]"
              >
                Experts
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-[#212121]">Company</h4>
          <ul className="mt-4 space-y-3 text-[#555555]">
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.About)}
                className="hover:text-[#212121]"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Careers)}
                className="hover:text-[#212121]"
              >
                Careers
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Contact)}
                className="hover:text-[#212121]"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-[#212121]">Legal</h4>
          <ul className="mt-4 space-y-3 text-[#555555]">
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Privacy)}
                className="hover:text-[#212121]"
              >
                Privacy
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => handleNavClick(e, View.Terms)}
                className="hover:text-[#212121]"
              >
                Terms of Use
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-[#E0E0E0] text-center text-[#555555] text-sm">
        <p>&copy; 2024 Vektraio Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};
