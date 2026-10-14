'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ArtworkLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  activeImage: string | null;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function ArtworkLightboxModal({
  isOpen,
  onClose,
  images,
  activeImage,
  currentIndex,
  onNavigate,
}: ArtworkLightboxModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onNavigate, onClose]);

  if (!isOpen || !activeImage) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 cursor-pointer transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation buttons if multiple images */}
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
              }}
              className="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-colors shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
              }}
              className="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-colors shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        ) : null}

        {/* High-Res Image Display */}
        <Image
          src={activeImage}
          alt={`Reference High-Res ${currentIndex + 1}`}
          width={1200}
          height={1200}
          unoptimized
          className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {images.length > 1 ? (
          <span className="mt-3 text-white/80 text-xs font-semibold">
            Image {currentIndex + 1} of {images.length}
          </span>
        ) : null}
      </div>
    </div>
  );
}

