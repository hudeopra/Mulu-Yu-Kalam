import { supabase, type Appointment } from '@/lib/supabase';

const DEFAULT_BUCKET = 'tattoo-references';

/**
 * Extracts all reference image URLs for an appointment from reference_image_urls (text[]).
 * Works uniformly for single or multiple images.
 */
export function getAppointmentReferenceUrls(
  appointment?: {
    reference_image_urls?: string[] | null;
  } | null,
): string[] {
  if (!appointment || !Array.isArray(appointment.reference_image_urls)) {
    return [];
  }

  return appointment.reference_image_urls.filter(
    (url): url is string => typeof url === 'string' && url.trim().length > 0,
  );
}

/**
 * Extracts relative storage object path from a Supabase Storage public URL.
 * e.g., 'https://.../tattoo-references/1743673000-0-art.webp' -> '1743673000-0-art.webp'
 */
export function extractStoragePath(
  url: string,
  bucketName: string = DEFAULT_BUCKET,
): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const marker = `/${bucketName}/`;
  const index = trimmed.indexOf(marker);
  if (index !== -1) {
    const rawPath = trimmed.slice(index + marker.length).split('?')[0];
    return decodeURIComponent(rawPath);
  }

  // Relative path or direct filename
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return decodeURIComponent(trimmed.split('?')[0]);
  }

  // Fallback to filename in URL
  const lastSegment = trimmed.split('/').pop()?.split('?')[0];
  return lastSegment ? decodeURIComponent(lastSegment) : null;
}

/**
 * Uploads a list of image files to Supabase Storage with sanitized filenames and content types.
 * Returns both the generated public URLs and the storage paths for rollback support.
 */
export async function uploadReferenceFiles(
  files: File[],
  bucketName: string = DEFAULT_BUCKET,
): Promise<{ publicUrls: string[]; storagePaths: string[] }> {
  const publicUrls: string[] = [];
  const storagePaths: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${Date.now()}-${i}-${cleanName}`;

    const mimeType =
      file.type ||
      (/\.webp$/i.test(file.name)
        ? 'image/webp'
        : /\.png$/i.test(file.name)
          ? 'image/png'
          : 'image/jpeg');

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      const isSizeError = uploadError.message
        .toLowerCase()
        .includes('exceeded the maximum allowed size');

      if (isSizeError) {
        throw new Error(
          `Failed to upload reference artwork "${file.name}": The file exceeded the Supabase Storage bucket size limit. Please ensure the "${bucketName}" bucket size limit is updated to 2.5MB in your Supabase Dashboard.`,
        );
      }

      throw new Error(
        `Failed to upload reference artwork "${file.name}": ${uploadError.message}`,
      );
    }

    storagePaths.push(filePath);

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    publicUrls.push(urlData.publicUrl);
  }

  return { publicUrls, storagePaths };
}

/**
 * Removes a list of files by their storage paths from Supabase Storage.
 */
export async function removeStorageFiles(
  paths: string[],
  bucketName: string = DEFAULT_BUCKET,
): Promise<void> {
  if (paths.length === 0) return;
  try {
    const { error } = await supabase.storage.from(bucketName).remove(paths);
    if (error) {
      console.warn(
        `[StorageService] Failed to remove paths from "${bucketName}":`,
        error.message,
      );
    }
  } catch (err) {
    console.warn('[StorageService] Remove storage exception:', err);
  }
}

/**
 * Deletes all reference image files belonging to an appointment from Supabase Storage bucket.
 */
export async function deleteAppointmentStorageImages(
  appointment?: {
    reference_image_urls?: string[] | null;
  } | null,
  bucketName: string = DEFAULT_BUCKET,
): Promise<void> {
  if (!appointment) return;

  const urls = getAppointmentReferenceUrls(appointment);
  if (urls.length === 0) return;

  const paths = urls
    .map((u) => extractStoragePath(u, bucketName))
    .filter((p): p is string => Boolean(p && p.length > 0));

  await removeStorageFiles(paths, bucketName);
}

/**
 * Renames all reference image files belonging to an appointment with a "suspended-" prefix in Supabase Storage,
 * and returns the updated array of public URLs.
 */
export async function suspendAppointmentStorageImages(
  appointment?: {
    reference_image_urls?: string[] | null;
  } | null,
  bucketName: string = DEFAULT_BUCKET,
): Promise<string[]> {
  if (!appointment) return [];

  const urls = getAppointmentReferenceUrls(appointment);
  if (urls.length === 0) return [];

  const updatedUrls: string[] = [];

  for (const url of urls) {
    const originalPath = extractStoragePath(url, bucketName);
    if (!originalPath) {
      updatedUrls.push(url);
      continue;
    }

    const segments = originalPath.split('/');
    const fileName = segments[segments.length - 1];

    // Avoid double prefixing if already suspended
    if (fileName.startsWith('suspended-')) {
      updatedUrls.push(url);
      continue;
    }

    segments[segments.length - 1] = `suspended-${fileName}`;
    const newPath = segments.join('/');

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .move(originalPath, newPath);

      if (error) {
        console.warn(
          `[StorageService] Failed to rename image to "${newPath}":`,
          error.message,
        );
        updatedUrls.push(url);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(newPath);
        updatedUrls.push(publicUrlData.publicUrl);
      }
    } catch (err) {
      console.warn('[StorageService] Exception while renaming image:', err);
      updatedUrls.push(url);
    }
  }

  return updatedUrls;
}

export interface SiteAssetUploadOptions {
  folder: 'gallery' | 'settings';
  filenamePrefix: string;
  previousStoragePath?: string | null;
  bucketName?: string;
}

/**
 * Uploads a site asset (gallery slot, logo, banner, favicon) with automatic deletion
 * of the superseded previous asset from Supabase Storage to avoid overcrowding.
 */
export async function uploadAndReplaceSiteAsset(
  file: File,
  options: SiteAssetUploadOptions,
): Promise<{ publicUrl: string; storagePath: string }> {
  const bucketName = options.bucketName || DEFAULT_BUCKET;

  // 1. Delete superseded file from storage if previous storage path exists
  if (options.previousStoragePath) {
    try {
      await removeStorageFiles([options.previousStoragePath], bucketName);
    } catch (err) {
      console.warn('[StorageService] Could not remove previous asset:', err);
    }
  }

  // 2. Determine file extension and sanitize
  const ext = file.name.split('.').pop() || 'webp';
  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const filePath = `${options.folder}/${options.filenamePrefix}-${Date.now()}.${cleanExt}`;

  const mimeType =
    file.type ||
    (/\.webp$/i.test(file.name)
      ? 'image/webp'
      : /\.png$/i.test(file.name)
        ? 'image/png'
        : /\.svg$/i.test(file.name)
          ? 'image/svg+xml'
          : 'image/jpeg');

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload asset: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return {
    publicUrl: urlData.publicUrl,
    storagePath: filePath,
  };
}


