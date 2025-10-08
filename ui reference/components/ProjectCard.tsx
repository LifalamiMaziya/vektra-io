import React from "react";

export const ProjectCard = ({
  imgSrc,
  title,
  delay,
  onClick
}: {
  imgSrc: string;
  title: string;
  delay?: string;
  onClick?: () => void;
}) => {
  const CardContent = () => (
    <>
      <img
        src={imgSrc}
        alt="Project Thumbnail"
        className="aspect-[16/10] object-cover w-full"
      />
      <div className="p-4">
        <h3 className="font-semibold text-[#212121] truncate" title={title}>
          {title}
        </h3>
      </div>
    </>
  );

  const cardClasses =
    "project-card bg-white border border-[#E0E0E0] rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-lg shadow-black/5 hover:-translate-y-2 hover:border-[#C87550] hover:shadow-xl reveal-on-scroll opacity-0 translate-y-[30px] h-full flex flex-col";

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${cardClasses} text-left`}
        style={{ transitionDelay: delay }}
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div className={cardClasses} style={{ transitionDelay: delay }}>
      <CardContent />
    </div>
  );
};
