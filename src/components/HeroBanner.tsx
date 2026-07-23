import React, { useState } from "react";
import { Image as GalleryIcon, Calendar } from "lucide-react";

export const HeroBanner: React.FC = () => {
  const [isEnjoyActive, setIsEnjoyActive] = useState(false);
  const [isBookingActive, setIsBookingActive] = useState(false);

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookingActive(true);
    setIsEnjoyActive(false);
    const contactElement = document.getElementById("contact");
    if (contactElement) {
      setTimeout(() => {
        contactElement.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  };

  const handleBtnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEnjoyActive(true);
    setIsBookingActive(false);
    // Smooth scroll down to gallery
    const galleryElement = document.getElementById("gallery");
    if (galleryElement) {
      setTimeout(() => {
        galleryElement.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  };

  return (
    <section className="relative min-h-screen pt-32 lg:pt-48 bg-[url('/assets/img/banner-bg.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden flex flex-col justify-between">
      {/* Background Title layer */}
      <div className="absolute top-28 sm:top-36 lg:top-44 left-1/2 -translate-x-1/2 w-11/12 max-w-7xl text-center pointer-events-none select-none z-0">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] xl:text-[130px] font-extrabold uppercase tracking-tight text-[#ff7b01]/90 leading-none">
          Ink Your Story
        </h1>
      </div>

      {/* Foreground glowing outline title */}
      <div className="absolute top-28 sm:top-36 lg:top-44 left-1/2 -translate-x-1/2 w-11/12 max-w-7xl text-center pointer-events-none select-none z-10">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[110px] xl:text-[130px] font-extrabold uppercase tracking-tight text-transparent leading-none text-outline-glow">
          Ink Your Story
        </h1>
      </div>

      {/* Interactive CTA Action Buttons */}
      <div className="absolute top-[48%] sm:top-[50%] lg:top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        {/* Book an Appointment Button */}
        <a
          href="#contact"
          onClick={handleBookClick}
          className={`inline-flex items-center justify-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg transition-all duration-300 shadow-xl backdrop-blur-sm border border-white/20 hover:scale-105 active:scale-95 ${
            isBookingActive
              ? "bg-gradient-to-r from-[#ff7b01] to-[#ff4500] ring-4 ring-[#ffbd5b]/50"
              : "bg-gradient-to-r from-[#ff7b01] via-[#e65c00] to-[#ff7b01] hover:brightness-110 shadow-orange-500/25"
          }`}
        >
          <Calendar
            className={`w-6 h-6 transition-transform ${isBookingActive ? "scale-125 rotate-12" : ""}`}
          />
          {!isBookingActive ? (
            <span className="tracking-wide whitespace-nowrap">
              Book an Appointment
            </span>
          ) : (
            <span className="animate-tracking-in text-[#ffeedd] font-bold whitespace-nowrap">
              Let's Ink!
            </span>
          )}
        </a>

        {/* Portfolio Button */}
        <a
          href="#gallery"
          onClick={handleBtnClick}
          className={`inline-flex items-center justify-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg transition-all duration-300 shadow-xl backdrop-blur-sm border border-white/20 hover:scale-105 active:scale-95 ${
            isEnjoyActive
              ? "bg-gradient-to-r from-[#ff7b01] to-[#ff4500] ring-4 ring-[#ffbd5b]/50"
              : "bg-gradient-to-r from-[#ff7b01] via-[#e65c00] to-[#ff7b01] hover:brightness-110 shadow-orange-500/25"
          }`}
        >
          <GalleryIcon
            className={`w-6 h-6 transition-transform ${isEnjoyActive ? "scale-125 rotate-12" : ""}`}
          />
          {!isEnjoyActive ? (
            <span className="tracking-wide whitespace-nowrap">Portfolio</span>
          ) : (
            <span className="animate-tracking-in text-[#ffeedd] font-bold whitespace-nowrap">
              Enjoy
            </span>
          )}
        </a>
      </div>

      {/* Bottom Container: Tattoo showcase grid + User silhouette */}
      <div className="relative z-10 mt-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
        <div className="hidden lg:grid grid-cols-12 gap-8 items-end">
          {/* Asymmetric Tattoo Grid */}
          <div className="col-span-7 pb-4">
            <div
              className="grid gap-2.5 p-2 rounded-2xl"
              style={{
                gridTemplateColumns: "1.618fr 1fr 1.618fr 1fr 1.618fr",
                gridAutoRows: "95px",
              }}
            >
              {/* Item 1 */}
              <div
                className="overflow-hidden rounded-xl shadow-lg group relative"
                style={{ gridArea: "4 / 1 / 6 / 3" }}
              >
                <img
                  src="/assets/img/tattoo-1.webp"
                  alt="Tattoo Showcase 1"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 2 */}
              <div
                className="overflow-hidden rounded-xl shadow-lg group relative"
                style={{ gridArea: "2 / 1 / 4 / 3" }}
              >
                <img
                  src="/assets/img/tattoo-2.webp"
                  alt="Tattoo Showcase 2"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 3 */}
              <div
                className="overflow-hidden rounded-xl shadow-lg group relative"
                style={{ gridArea: "4 / 3 / 6 / 5" }}
              >
                <img
                  src="/assets/img/tattoo-3.webp"
                  alt="Tattoo Showcase 3"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 4 */}
              <div
                className="overflow-hidden rounded-xl shadow-lg group relative"
                style={{ gridArea: "1 / 1 / 2 / 2" }}
              >
                <img
                  src="/assets/img/tattoo-4.webp"
                  alt="Tattoo Showcase 4"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 5 */}
              <div
                className="overflow-hidden rounded-xl shadow-lg group relative"
                style={{ gridArea: "3 / 3 / 4 / 4" }}
              >
                <img
                  src="/assets/img/tattoo-5.webp"
                  alt="Tattoo Showcase 5"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 6 */}
              <div
                className="overflow-hidden rounded-xl shadow-lg group relative"
                style={{ gridArea: "5 / 5 / 6 / 6" }}
              >
                <img
                  src="/assets/img/tattoo-6.webp"
                  alt="Tattoo Showcase 6"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
          </div>

          {/* User model silhouette */}
          <div className="col-span-5 flex justify-end">
            <div className="relative bottom-0 max-w-[420px] drop-shadow-2xl">
              <img
                src="/assets/img/user.png"
                alt="Tattoo Artist / Model"
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
