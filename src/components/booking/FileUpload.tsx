'use client';

import {
  useRef,
  useState,
  useEffect,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import {
  UploadCloud,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import {
  compressImage,
  formatFileSize,
  type CompressionResult,
} from '@/utils/imageCompressor';

export interface FileUploadProps {
  value?: File[] | null;
  onChange: (files: File[]) => void;
  error?: string;
  maxFiles?: number;
}

interface UploadedItem {
  id: string;
  file: File;
  previewUrl: string;
  metrics?: CompressionResult;
}

export function FileUpload({
  value,
  onChange,
  error,
  maxFiles = 5,
}: FileUploadProps) {
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressingProgress, setCompressingProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<UploadedItem[]>(items);
  itemsRef.current = items;

  // Sync with value prop (e.g. on form reset)
  useEffect(() => {
    const currentFiles = value || [];

    if (currentFiles.length === 0 && itemsRef.current.length > 0) {
      itemsRef.current.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      });
      setItems([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [value]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      });
    };
  }, []);

  const processFiles = async (rawFiles: File[]) => {
    setLocalError(null);

    // Filter valid image types
    const validFiles = rawFiles.filter(
      (file) =>
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp)$/i.test(file.name),
    );

    if (validFiles.length === 0) {
      setLocalError(
        'Please upload valid image files (.jpg, .jpeg, .png, .webp).',
      );
      return;
    }

    const remainingSlots = maxFiles - items.length;
    if (remainingSlots <= 0) {
      setLocalError(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    const filesToProcess = validFiles.slice(0, remainingSlots);
    if (validFiles.length > remainingSlots) {
      setLocalError(
        `Added the first ${remainingSlots} images to stay within the ${maxFiles} image limit.`,
      );
    }

    try {
      setIsCompressing(true);
      const newItems: UploadedItem[] = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setCompressingProgress({
          current: i + 1,
          total: filesToProcess.length,
        });

        try {
          // Compress to guaranteed <= 2MB WebP
          const result = await compressImage(file, 2.5 * 1024 * 1024);
          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            file: result.file,
            previewUrl: result.previewUrl,
            metrics: result,
          });
        } catch (err) {
          console.error('Image compression failed for:', file.name, err);
          const fallbackUrl = URL.createObjectURL(file);
          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            file,
            previewUrl: fallbackUrl,
          });
        }
      }

      const updatedItems = [...items, ...newItems];
      setItems(updatedItems);
      onChange(updatedItems.map((item) => item.file));
    } finally {
      setIsCompressing(false);
      setCompressingProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const itemToRemove = items[indexToRemove];
    if (itemToRemove?.previewUrl) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }

    const updatedItems = items.filter((_, i) => i !== indexToRemove);
    setItems(updatedItems);
    onChange(updatedItems.map((item) => item.file));
    setLocalError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-800">
          Tattoo References / Designs (Optional)
        </label>
        <span className="text-xs text-gray-500 font-medium">
          {items.length > 0
            ? `${items.length} of ${maxFiles} selected`
            : `Max ${maxFiles} images (2MB each)`}
        </span>
      </div>

      <input
        id="tattoo-reference-upload"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        multiple
      />

      {isCompressing && (
        <div className="border-2 border-dashed border-[#ff7b01] bg-[#ffecd0]/40 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 mb-3">
          <Loader2 className="w-8 h-8 text-[#ff7b01] animate-spin" />
          <p className="text-sm font-semibold text-[#2e0249]">
            {compressingProgress
              ? `Optimizing reference image ${compressingProgress.current} of ${compressingProgress.total}...`
              : 'Optimizing & compressing reference artwork...'}
          </p>
          <p className="text-xs text-gray-500">
            Scaling to 1600px & encoding to WebP under 2MB
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <label
          htmlFor="tattoo-reference-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 bg-white/70 hover:bg-white select-none ${
            error || localError
              ? 'border-red-500 bg-red-50/50'
              : isDragging
                ? 'border-[#ff7b01] bg-[#ffecd0]/50 scale-[0.99]'
                : 'border-[#ffbd5b] hover:border-[#ff7b01]'
          }`}
        >
          <div className="p-3 bg-[#ffecd0] text-[#ff7b01] rounded-full shadow-sm pointer-events-none">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-700 pointer-events-none">
            <span className="text-[#ff7b01] font-semibold underline">
              Click to upload
            </span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-gray-400 pointer-events-none">
            PNG, JPG, or WEBP &bull; Upload up to {maxFiles} images (Max 2MB
            each)
          </p>
        </label>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="relative rounded-2xl border-2 border-[#ffbd5b] bg-white p-3 flex items-center gap-3 shadow-xs hover:border-[#ff7b01] transition-colors"
              >
                <Image
                  src={item.previewUrl}
                  alt={`Reference preview ${index + 1}`}
                  width={56}
                  height={56}
                  unoptimized
                  className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-2xs shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold text-gray-900 truncate"
                    title={item.file.name}
                  >
                    {item.file.name}
                  </p>

                  {item.metrics && item.metrics.reductionPercent > 0 ? (
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        {formatFileSize(item.metrics.originalSize)} &rarr;{' '}
                        {formatFileSize(item.metrics.compressedSize)} (-
                        {item.metrics.reductionPercent}%)
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {formatFileSize(item.file.size)}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  aria-label={`Remove reference image ${index + 1}`}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {items.length < maxFiles && !isCompressing && (
            <label
              htmlFor="tattoo-reference-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-3 text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 bg-white/70 hover:bg-[#ffecd0]/30 select-none ${
                isDragging
                  ? 'border-[#ff7b01] bg-[#ffecd0]/50 scale-[0.99]'
                  : 'border-[#ffbd5b] hover:border-[#ff7b01]'
              }`}
            >
              <Plus className="w-4 h-4 text-[#ff7b01] pointer-events-none" />
              <span className="text-xs font-semibold text-[#ff7b01] pointer-events-none">
                Add more images ({maxFiles - items.length} slot
                {maxFiles - items.length === 1 ? '' : 's'} remaining)
              </span>
            </label>
          )}
        </div>
      )}

      {(error || localError) && (
        <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error || localError}</span>
        </p>
      )}
    </div>
  );
}
