'use client';

import { useState, type MouseEvent } from 'react';
import { Image as GalleryIcon, Calendar } from 'lucide-react';

export function HeroActionButtons() {
  const [isEnjoyActive, setIsEnjoyActive] = useState(false);
  const [isBookingActive, setIsBookingActive] = useState(false);

  const handleBookClick = (e: MouseEvent) => {
    e.preventDefault();
    setIsBookingActive(true);
    setIsEnjoyActive(false);
    setTimeout(() => {
      const contactElement = document.getElementById('contact');
      if (contactElement) {
        contactElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000); // one sec delay to scroll
  };

  const handleBtnClick = (e: MouseEvent) => {
    e.preventDefault();
    setIsEnjoyActive(true);
    setIsBookingActive(false);
    setTimeout(() => {
      const galleryElement = document.getElementById('gallery');
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000); // one sec delay to scroll
  };

  return (
    <div className="h-[80vh] relative top-20 lg:top-44 z-[99] lg:h-auto w-full px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
      {/* Book an Appointment Button */}
      <a
        href="#contact"
        onClick={handleBookClick}
        className={`inline-flex items-center justify-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg transition-all duration-300 shadow-xl backdrop-blur-sm border border-white/20 hover:scale-105 active:scale-95 ${
          isBookingActive
            ? 'bg-gradient-to-r from-[#ff7b01] to-[#fc0101] ring-4 ring-[#ffbd5b]/50'
            : 'bg-gradient-to-r from-[#ff7b01] via-[#e65c00] to-[#ff7b01] hover:brightness-110 shadow-orange-500/25'
        }`}
      >
        <Calendar
          className={`w-6 h-6 transition-transform ${isBookingActive ? 'scale-125 rotate-12' : ''}`}
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
            ? 'bg-gradient-to-r from-[#ff7b01] to-[#ff4500] ring-4 ring-[#ffbd5b]/50'
            : 'bg-gradient-to-r from-[#ff7b01] via-[#e65c00] to-[#ff7b01] hover:brightness-110 shadow-orange-500/25'
        }`}
      >
        <GalleryIcon
          className={`w-6 h-6 transition-transform ${isEnjoyActive ? 'scale-125 rotate-12' : ''}`}
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
  );
}
