import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="relative w-full z-20">
      <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-20">
        <a href="#" className="block group" aria-label="Mulu Yu Kalam Home">
          <img
            src="/assets/img/Mulu-Yu-Kalam.svg"
            alt="Mulu Yu Kalam Logo"
            className="w-[200px] md:w-[350px] h-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        </a>
      </div>
    </header>
  );
};
