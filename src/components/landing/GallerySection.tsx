import Image from 'next/image';
import { SiteGalleryItem, DEFAULT_GALLERY_ITEMS } from '@/types/landing';

interface GallerySectionProps {
  galleryItems?: SiteGalleryItem[];
}

export function GallerySection({
  galleryItems = DEFAULT_GALLERY_ITEMS,
}: GallerySectionProps) {
  // Ensure items are ordered by display_order / slot_number
  const items =
    galleryItems && galleryItems.length > 0
      ? galleryItems
      : DEFAULT_GALLERY_ITEMS;

  return (
    <section id="gallery" className="pb-20 md:pb-28 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="gallery-parent-grid">
          {/* Item 10: Center / Top Gallery Banner */}
          <div className="gallery-item-10 rounded-2xl overflow-hidden text-[#ff7b01] bg-[#ffecd0] flex flex-col justify-center items-center p-6 shadow-md border border-[#ffbd5b]/30">
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold uppercase text-center leading-none tracking-tight">
              Our Gallery
            </h2>
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#ff7b01]/80 mt-2 uppercase">
              Curated Masterpieces
            </span>
          </div>

          {/* Gallery Items 1 through 9, 11 through 14 */}
          {items.map((item) => (
            <div
              key={`${item.section || 'gallery'}-${item.slot_number}`}
              className={`${item.item_class} rounded-2xl overflow-hidden relative shadow-md group border border-black/5 bg-gray-100`}
            >
              <Image
                src={item.image_url}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
              {/* On-Hover Title Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
                  {item.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
