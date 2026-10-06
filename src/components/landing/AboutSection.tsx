import { MessageCircle, Camera, Share2, Video, MapPin } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export function AboutSection() {
  return (
    <section id="about" className="relative w-full bg-white overflow-hidden">
      {/* Top right floating social bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute right-4 sm:right-6 lg:right-8 -top-0 z-20">
          <ul className="flex items-center gap-5 sm:gap-6 bg-[#ff7b01] text-white py-4 sm:py-5 px-8 sm:px-12 rounded-b-2xl shadow-xl">
            <li>
              <a
                href="https://wa.me/9779861341995/"
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
                href="https://www.instagram.com/mulu_yu_kalam/"
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
                href="https://www.facebook.com/MuluYuKalam"
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
                href="https://www.tiktok.com/@mulu_yu_kalam"
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-48 lg:pb-76 bg-none lg:bg-[url('/assets/img/bg-img.svg')] bg-no-repeat bg-contain bg-size-[70%] bg-[center_112%]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 justify-between items-center">
          {/* Text content column */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#2e0249] tracking-tight relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#ff7b01] after:rounded-full">
              About Us
            </h2>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              Welcome to{' '}
              <span className="font-semibold text-[#2e0249]">
                Mulu Yu Kalam
              </span>
              —Lalitpur&apos;s dedicated custom tattoo studio located in
              Harisiddhi, Nepal. Born from a passion for authentic body art and
              visual storytelling, our artists specialize in bespoke tattooing
              across delicate fine-line, realism, illustrative styles, and
              meaningful custom concepts. Every tattoo is treated as a permanent
              work of art crafted specifically for you.
            </p>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg lg:w-4/5">
              We uphold uncompromising hygiene standards with hospital-grade
              sanitization, 100% single-use disposable needle cartridges, and
              premium certified skin-safe inks. Whether you are stepping in for
              your very first piece or crafting a comprehensive sleeve, we guide
              you from initial consultation through expert aftercare to make
              your tattoo journey exceptional.
            </p>
          </div>

          {/* Counters Column */}
          <div className="lg:col-span-5 lg:col-start-9">
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
}
