import React, { useEffect, useRef } from "react";

export const useScrollReveal = () => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const currentRef = containerRef.current;
    if (!currentRef) return;

    const revealElements = currentRef.querySelectorAll(".reveal-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-[30px]");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      if (currentRef) {
        revealElements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  return containerRef;
};
