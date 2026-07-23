import React, { useEffect, useState, useRef } from "react";
import { MessageCircle, Camera, Share2, Video, MapPin } from "lucide-react";

interface CounterProps {
  target: number;
  label: string;
  colorClass: string;
  bgClass: string;
  duration?: number;
}

const AnimatedCounter: React.FC<CounterProps> = ({
  target,
  label,
  colorClass,
  bgClass,
  duration = 2000,
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 },
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOut * target);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [hasAnimated, target, duration]);

  return (
    <div
      ref={ref}
      className={`text-center py-6 px-8 rounded-xl shadow-lg border border-black/5 transition-transform duration-300 hover:-translate-y-1 ${colorClass} ${bgClass}`}
    >
      <div className="text-4xl lg:text-5xl font-extrabold mb-2 tracking-tight">
        +{count}
      </div>
      <span className="block font-bold tracking-[3px] text-sm md:text-base uppercase">
        {label}
      </span>
    </div>
  );
};

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative w-full  bg-white overflow-hidden">
      {/* Top right floating social bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute right-4 sm:right-6 lg:right-8 -top-0 z-20">
          <ul className="flex items-center gap-5 sm:gap-6 bg-[#ff7b01] text-white py-4 sm:py-5 px-8 sm:px-12 rounded-b-2xl shadow-xl">
            <li>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <MessageCircle className="w-7 h-7" />
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <Camera className="w-7 h-7" />
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <Share2 className="w-7 h-7" />
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <Video className="w-7 h-7" />
              </a>
            </li>
            <li>
              <a
                href="https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Maps Location"
                className="block text-white hover:text-[#ffbd5b] hover:scale-125 transition-all"
              >
                <MapPin className="w-7 h-7" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Main About content container with background vector */}
      <div className="relative min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:py-48 bg-[url('/assets/img/bg-img.svg')] bg-no-repeat bg-contain bg-size-[70%]  bg-[center_115%]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 justify-between items-center">
          {/* Text content column */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#2e0249] tracking-tight relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#ff7b01] after:rounded-full">
              About Us
            </h2>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              Our highly qualified team of tattooists is always ready to help
              you make even the wildest ideas come true. The level of our
              artists’ creativity & skills allows them to work on the most
              stunning artworks. Our team ensures that you will get what you
              want for your body to look exceptional.
            </p>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg lg:w-4/5">
              Our highly qualified team of tattooists is always ready to help
              you make even the wildest ideas come true. The level of our
              artists’ creativity & skills allows them to work on the most
              stunning artworks. Our team ensures that you will get what you
              want for your body to look exceptional.
            </p>
          </div>

          {/* Counters Column */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
              <AnimatedCounter
                target={7}
                label="Years of Tattooing"
                colorClass="text-[#8d00ff]"
                bgClass="bg-[#f0ddff]"
              />
              <AnimatedCounter
                target={250}
                label="Successful Tattoos"
                colorClass="text-[#0067a5]"
                bgClass="bg-[#c3e9ff]"
              />
              <AnimatedCounter
                target={148}
                label="Customers Served"
                colorClass="text-[#ff7b01]"
                bgClass="bg-[#ffecd0]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
