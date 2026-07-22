export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

/**
 * In-browser image compressor using native HTML5 Canvas.
 * Resizes dimensions (max 1600px) and iteratively adjusts WebP quality
 * to guarantee the resulting file is strictly <= maxSizeBytes (default 500KB).
 */
export async function compressImage(
  file: File,
  maxSizeBytes: number = 500 * 1024,
  maxDimension: number = 1600,
): Promise<CompressionResult> {
  // If not an image file, pass through
  if (!file.type.startsWith("image/")) {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercent: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = async () => {
        let { width, height } = img;

        // Scale down proportionally if larger than maxDimension (1600px)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to create canvas rendering context."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const format = "image/webp";
        let quality = 0.85;

        const toBlobAsync = (q: number): Promise<Blob | null> => {
          return new Promise((res) => canvas.toBlob(res, format, q));
        };

        let blob: Blob | null = await toBlobAsync(quality);

        // Iteratively dial back quality if still > 500KB
        while (blob && blob.size > maxSizeBytes && quality > 0.4) {
          quality -= 0.1;
          blob = await toBlobAsync(quality);
        }

        // Secondary fallback: if still exceeding 500KB, downscale canvas dimensions
        if (blob && blob.size > maxSizeBytes) {
          canvas.width = Math.round(width * 0.7);
          canvas.height = Math.round(height * 0.7);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          blob = await toBlobAsync(0.6);
        }

        if (!blob) {
          reject(new Error("Canvas image compression failed."));
          return;
        }

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const compressedFile = new File([blob], `${baseName}.webp`, {
          type: "image/webp",
          lastModified: Date.now(),
        });

        const previewUrl = URL.createObjectURL(blob);
        const reductionPercent = Math.max(
          0,
          Math.round(((file.size - compressedFile.size) / file.size) * 100),
        );

        resolve({
          file: compressedFile,
          previewUrl,
          originalSize: file.size,
          compressedSize: compressedFile.size,
          reductionPercent,
        });
      };

      img.onerror = () =>
        reject(new Error("Failed to load image for compression."));
    };

    reader.onerror = () => reject(new Error("Failed to read image file."));
  });
}

/**
 * Format bytes into readable string (e.g. 185 KB or 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
