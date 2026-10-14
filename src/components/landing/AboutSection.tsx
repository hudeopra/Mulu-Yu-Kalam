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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="bi bi-whatsapp"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="bi bi-instagram"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="bi bi-facebook"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="bi bi-tiktok"
                  viewBox="0 0 16 16"
                >
                  <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
                </svg>
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
