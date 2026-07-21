import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#ff7b01] text-white py-4 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm sm:text-base font-medium tracking-wide">
          Copyright &copy; {new Date().getFullYear()} Mulu Yu Kalam. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};
