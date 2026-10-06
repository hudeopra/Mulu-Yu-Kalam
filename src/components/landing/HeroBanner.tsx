import Image from 'next/image';
import { HeroActionButtons } from './HeroActionButtons';

export function HeroBanner() {
  return (
    <section className="relative min-h-screen pt-32 lg:pt-48 bg-[url('/assets/img/banner-bg.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden flex flex-col justify-between">
      {/* Background Title layer */}
      <div className="absolute top-60 lg:top-44 left-1/2 -translate-x-1/2 w-11/12 max-w-7xl text-center pointer-events-none select-none z-0">
        <h1 className="text-5xl leading-20 text-7xl md:text-8xl md:mt-16 lg:text-[108px] xl:text-[130px] font-extrabold uppercase tracking-tight text-[#fc6001e6]/90 ">
          Ink Your Story
        </h1>
      </div>

      {/* Interactive CTA Action Buttons */}
      <HeroActionButtons />

      {/* Bottom Container: Tattoo showcase grid + User silhouette */}
      <div className="relative z-10 mt-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
        <div className="hidden lg:grid grid-cols-12 gap-8 items-end">
          {/* Asymmetric Tattoo Grid */}
          <div className="col-span-7 pb-4">
            <div className="hero-tattoo-grid p-2 rounded-2xl">
              {/* Item 1 */}
              <div className="hero-tattoo-item-1 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src="/assets/img/tattoo-1.webp"
                  alt="Tattoo Showcase 1"
                  width={320}
                  height={220}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 2 */}
              <div className="hero-tattoo-item-2 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src="/assets/img/tattoo-2.webp"
                  alt="Tattoo Showcase 2"
                  width={320}
                  height={220}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 3 */}
              <div className="hero-tattoo-item-3 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src="/assets/img/tattoo-3.webp"
                  alt="Tattoo Showcase 3"
                  width={320}
                  height={220}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 4 */}
              <div className="hero-tattoo-item-4 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src="/assets/img/tattoo-4.webp"
                  alt="Tattoo Showcase 4"
                  width={200}
                  height={110}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 5 */}
              <div className="hero-tattoo-item-5 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src="/assets/img/tattoo-5.webp"
                  alt="Tattoo Showcase 5"
                  width={200}
                  height={110}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 6 */}
              <div className="hero-tattoo-item-6 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src="/assets/img/tattoo-6.webp"
                  alt="Tattoo Showcase 6"
                  width={200}
                  height={110}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
          </div>

          {/* User model silhouette */}
          <div className="col-span-5 flex justify-end">
            <div className="relative bottom-0 max-w-[420px] drop-shadow-2xl">
              <Image
                src="/assets/img/user.png"
                alt="Tattoo Artist / Model"
                width={420}
                height={560}
                priority
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
