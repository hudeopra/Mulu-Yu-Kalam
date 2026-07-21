import React from "react";

interface GalleryItem {
  id: number;
  itemClass: string;
  imgSrc: string;
  alt: string;
}

export const GallerySection: React.FC = () => {
  const galleryItems: GalleryItem[] = [
    {
      id: 1,
      itemClass: "gallery-item-1",
      imgSrc: "/assets/img/tattoo-1.webp",
      alt: "Tattoo Artwork 1",
    },
    {
      id: 2,
      itemClass: "gallery-item-2",
      imgSrc: "/assets/img/gallery.jpg",
      alt: "Tattoo Artwork 2",
    },
    {
      id: 3,
      itemClass: "gallery-item-3",
      imgSrc: "/assets/img/tattoo-2.webp",
      alt: "Tattoo Artwork 3",
    },
    {
      id: 4,
      itemClass: "gallery-item-4",
      imgSrc: "/assets/img/tattoo-3.webp",
      alt: "Tattoo Artwork 4",
    },
    {
      id: 5,
      itemClass: "gallery-item-5",
      imgSrc: "/assets/img/tattoo-4.webp",
      alt: "Tattoo Artwork 5",
    },
    {
      id: 6,
      itemClass: "gallery-item-6",
      imgSrc: "/assets/img/gallery.jpg",
      alt: "Tattoo Artwork 6",
    },
    {
      id: 7,
      itemClass: "gallery-item-7",
      imgSrc: "/assets/img/tattoo-5.webp",
      alt: "Tattoo Artwork 7",
    },
    {
      id: 8,
      itemClass: "gallery-item-8",
      imgSrc: "/assets/img/gallery.jpg",
      alt: "Tattoo Artwork 8",
    },
    {
      id: 9,
      itemClass: "gallery-item-9",
      imgSrc: "/assets/img/tattoo-6.webp",
      alt: "Tattoo Artwork 9",
    },
    {
      id: 11,
      itemClass: "gallery-item-11",
      imgSrc: "/assets/img/gallery.jpg",
      alt: "Tattoo Artwork 11",
    },
    {
      id: 12,
      itemClass: "gallery-item-12",
      imgSrc: "/assets/img/tattoo-2.webp",
      alt: "Tattoo Artwork 12",
    },
    {
      id: 13,
      itemClass: "gallery-item-13",
      imgSrc: "/assets/img/tattoo-1.webp",
      alt: "Tattoo Artwork 13",
    },
    {
      id: 14,
      itemClass: "gallery-item-14",
      imgSrc: "/assets/img/gallery.jpg",
      alt: "Tattoo Artwork 14",
    },
  ];

  return (
    <section id="gallery" className="py-20 md:py-28 bg-white overflow-hidden">
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
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className={`${item.itemClass} rounded-2xl overflow-hidden relative shadow-md group border border-black/5 bg-gray-100`}
            >
              <img
                src={item.imgSrc}
                alt={item.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
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
};
