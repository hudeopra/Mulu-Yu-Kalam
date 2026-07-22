import React, { useRef, useState, useEffect } from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  compressImage,
  formatFileSize,
  type CompressionResult,
} from "../utils/imageCompressor";

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMetrics, setCompressionMetrics] =
    useState<CompressionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setCompressionMetrics(null);
      return;
    }

    if (!previewUrl) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
    }
  }, [value, previewUrl]);

  const processFile = async (rawFile: File) => {
    try {
      setIsCompressing(true);
      const result = await compressImage(rawFile, 500 * 1024); // 500KB cap
      setCompressionMetrics(result);
      setPreviewUrl(result.previewUrl);
      onChange(result.file);
    } catch (err) {
      console.error("Image compression failed, using original file:", err);
      onChange(rawFile);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCompressionMetrics(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-800">
          Tattoo Reference / Design (Optional)
        </label>
        <span className="text-xs text-gray-500 font-medium">
          Max 500KB (Auto-optimized)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      {isCompressing ? (
        <div className="border-2 border-dashed border-[#ff7b01] bg-[#ffecd0]/40 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#ff7b01] animate-spin" />
          <p className="text-sm font-semibold text-[#2e0249]">
            Optimizing & compressing reference artwork...
          </p>
          <p className="text-xs text-gray-500">
            Scaling to 1600px & encoding to WebP under 500KB
          </p>
        </div>
      ) : !value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 bg-white/70 hover:bg-white ${
            error
              ? "border-red-500 bg-red-50/50"
              : isDragging
                ? "border-[#ff7b01] bg-[#ffecd0]/50 scale-[0.99]"
                : "border-[#ffbd5b] hover:border-[#ff7b01]"
          }`}
        >
          <div className="p-3 bg-[#ffecd0] text-[#ff7b01] rounded-full shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            <span className="text-[#ff7b01] font-semibold underline">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-400">
            PNG, JPG, or WEBP (Automatically compressed to &lt; 500KB)
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl border-2 border-[#ffbd5b] bg-white p-3.5 flex items-center gap-4 shadow-sm">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Reference Preview"
              className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {value.name}
            </p>

            {/* Live compression reduction badge */}
            {compressionMetrics && compressionMetrics.reductionPercent > 0 ? (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  {formatFileSize(compressionMetrics.originalSize)} →{" "}
                  {formatFileSize(compressionMetrics.compressedSize)} (-
                  {compressionMetrics.reductionPercent}%)
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  Ready for upload
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                {formatFileSize(value.size)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove reference image"
            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
};
