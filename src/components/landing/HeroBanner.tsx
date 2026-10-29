import Image from 'next/image';
import { HeroActionButtons } from './HeroActionButtons';
import { SiteGalleryItem, DEFAULT_HERO_ITEMS } from '@/types/landing';

interface HeroBannerProps {
  bannerBgUrl?: string;
  showcaseItems?: SiteGalleryItem[];
}

export function HeroBanner({
  bannerBgUrl = '/assets/img/banner-bg.jpg',
  showcaseItems = DEFAULT_HERO_ITEMS,
}: HeroBannerProps) {
  // Helper to get slot item with fallback
  const getSlot = (slotNumber: number) => {
    const found = showcaseItems.find((item) => item.slot_number === slotNumber);
    if (found) return found;
    return (
      DEFAULT_HERO_ITEMS.find((item) => item.slot_number === slotNumber) || {
        slot_number: slotNumber,
        image_url: `/assets/img/tattoo-${slotNumber}.webp`,
        alt: `Tattoo Showcase ${slotNumber}`,
      }
    );
  };

  const slot1 = getSlot(1);
  const slot2 = getSlot(2);
  const slot3 = getSlot(3);
  const slot4 = getSlot(4);
  const slot5 = getSlot(5);
  const slot6 = getSlot(6);

  return (
    <section
      className="relative min-h-screen pt-32 lg:pt-48 bg-cover bg-center bg-no-repeat overflow-hidden flex flex-col justify-between"
      style={{
        backgroundImage: `url('${bannerBgUrl || '/assets/img/banner-bg.jpg'}')`,
      }}
    >
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
                  src={slot1.image_url}
                  alt={slot1.alt}
                  width={320}
                  height={220}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 2 */}
              <div className="hero-tattoo-item-2 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src={slot2.image_url}
                  alt={slot2.alt}
                  width={320}
                  height={220}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 3 */}
              <div className="hero-tattoo-item-3 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src={slot3.image_url}
                  alt={slot3.alt}
                  width={320}
                  height={220}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 4 */}
              <div className="hero-tattoo-item-4 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src={slot4.image_url}
                  alt={slot4.alt}
                  width={200}
                  height={110}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 5 */}
              <div className="hero-tattoo-item-5 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src={slot5.image_url}
                  alt={slot5.alt}
                  width={200}
                  height={110}
                  priority
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Item 6 */}
              <div className="hero-tattoo-item-6 overflow-hidden rounded-xl shadow-lg group relative">
                <Image
                  src={slot6.image_url}
                  alt={slot6.alt}
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
