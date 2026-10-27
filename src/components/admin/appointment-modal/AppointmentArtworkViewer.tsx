'use client';

import Image from 'next/image';
import {
  ZoomIn,
  ExternalLink,
  Download,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

interface AppointmentArtworkViewerProps {
  appointmentId: string;
  referenceUrls: string[];
  activeImageUrl: string | null;
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
  onOpenLightbox: () => void;
  onDeleteImage: () => void;
  isDeletingImage: boolean;
  onRequestDeleteAppointment: () => void;
  canDelete?: boolean;
}

export function AppointmentArtworkViewer({
  appointmentId,
  referenceUrls,
  activeImageUrl,
  selectedImageIndex,
  onSelectImage,
  onOpenLightbox,
  onDeleteImage,
  isDeletingImage,
  onRequestDeleteAppointment,
  canDelete = false,
}: AppointmentArtworkViewerProps) {
  return (
    <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/80 h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-[#2e0249] text-sm mb-3 flex items-center justify-between">
          <span>Artwork Reference</span>
          {referenceUrls.length > 0 ? (
            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
              {referenceUrls.length}{' '}
              {referenceUrls.length === 1 ? 'Image' : 'Images'} Uploaded
            </span>
          ) : null}
        </h3>

        {activeImageUrl ? (
          <div className="space-y-3">
            {/* Primary Image View with Zoom Trigger */}
            <div
              onClick={onOpenLightbox}
              className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-black/5 border border-gray-200 cursor-zoom-in shadow-xs"
            >
              <Image
                src={activeImageUrl}
                alt={`Tattoo Reference ${selectedImageIndex + 1}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-medium">
                <ZoomIn className="w-4 h-4" />
                <span>Click to Zoom</span>
              </div>
              {referenceUrls.length > 1 ? (
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {selectedImageIndex + 1} of {referenceUrls.length}
                </span>
              ) : null}
            </div>

            {/* Thumbnail selector strip if multiple images */}
            {referenceUrls.length > 1 ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {referenceUrls.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectImage(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#ff7b01] shadow-md ring-2 ring-[#ff7b01]/20 scale-105'
                        : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                    title={`View image ${idx + 1}`}
                  >
                    <Image
                      src={url}
                      alt={`Thumb ${idx + 1}`}
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-bold px-1 rounded-sm">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Reference Image Quick Actions */}
            <div className="flex items-center gap-2">
              <a
                href={activeImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#2e0249] text-xs font-semibold shadow-2xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>

              <a
                href={activeImageUrl}
                download={`mulu_tattoo_ref_${appointmentId}_${selectedImageIndex + 1}`}
                className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#2e0249] shadow-2xs transition-colors"
                title="Download reference image"
              >
                <Download className="w-4 h-4" />
              </a>

              {canDelete ? (
                <button
                  type="button"
                  onClick={onDeleteImage}
                  disabled={isDeletingImage}
                  className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete this reference image from storage"
                >
                  {isDeletingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">
              No Reference Artwork
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              The client did not upload an image during booking. Discuss concept
              in studio.
            </p>
          </div>
        )}
      </div>

      {/* Danger Zone: Delete (Only admin can delete) */}
      {canDelete ? (
        <div className="pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onRequestDeleteAppointment}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete this Appointment</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

