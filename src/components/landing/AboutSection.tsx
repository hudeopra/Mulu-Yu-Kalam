import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  MapPinIcon,
} from '@/components/icons';
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
                <WhatsAppIcon className="w-6 h-6" />
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
                <InstagramIcon className="w-6 h-6" />
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
                <FacebookIcon className="w-6 h-6" />
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
                <TikTokIcon className="w-6 h-6" />
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
                <MapPinIcon className="w-7 h-7" />
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
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2e0249] tracking-tight relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-34 after:h-1 after:bg-[#ff7b01] after:rounded-full">
                About Mulu Yu Kalam
              </h2>
            </div>

            <p className="text-gray-700 leading-relaxed text-base  ">
              Welcome to{' '}
              <span className="font-bold text-[#2e0249]">Mulu Yu Kalam</span>
              —Lalitpur&apos;s premier custom tattoo studio nestled in
              Harisiddhi, Nepal. Driven by a genuine passion for authentic body
              art, creative ink illustration, and personal storytelling, our
              studio transforms your thoughts, stories, and heritage into
              permanent, breathtaking custom tattoo artwork crafted with
              anatomical precision.
            </p>

            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              Whether you are looking for your very first tattoo, seeking an
              intricate custom design, requesting a tattoo coverup, or finishing
              an existing piece, our experienced tattoo artists in Harisiddhi
              provide free design consultations, walk-in visits, and
              comprehensive healing aftercare to make your tattoo experience
              unforgettable.
            </p>

            <div className="flex lg:flex-col lg:w-8/12 gap-4 pt-1">
              <div className="bg-[#ffecd0]/50 p-4 rounded-xl border border-[#ffbd5b]/40">
                <h3 className="font-bold text-[#2e0249] text-base mb-1">
                  Custom Tattoo Artwork & Design
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Specializing in fine line tattoos, micro-realism, illustrative
                  ink, sacred Nepalese mandala patterns, and complete sleeve
                  compositions tailored to your vision.
                </p>
              </div>

              <div className="bg-[#ffecd0]/50 p-4 rounded-xl border border-[#ffbd5b]/40">
                <h3 className="font-bold text-[#2e0249] text-base mb-1">
                  Sterile Hygiene & Safety Standards
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your health and safety come first. We strictly use 100%
                  single-use disposable needle cartridges, medical autoclave
                  sterilization, and premium certified vegan inks.
                </p>
              </div>
            </div>
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
