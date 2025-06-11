import path from 'path';
import fs from 'fs/promises';
import { CDNConfig } from '../config/cdn.config';

/**
 * Validate if a file path is within the allowed CDN directory
 * @param filePath Path to the file being accessed
 * @param config CDN configuration
 * @returns True if file is within the allowed directory, false otherwise
 */
export async function isFileAccessAllowed(
  filePath: string, 
  config: CDNConfig
): Promise<boolean> {
  try {
    // Resolve the absolute path of the file
    const resolvedFilePath = path.resolve(filePath);
    const rootDir = path.resolve(config.rootDirectory);

    // Check if the file is within the root directory
    if (!resolvedFilePath.startsWith(rootDir)) {
      return false;
    }

    // Check file existence
    await fs.access(resolvedFilePath);

    // Validate file extension if configured
    if (config.allowedFileExtensions) {
      const fileExt = path.extname(resolvedFilePath).toLowerCase();
      if (!config.allowedFileExtensions.includes(fileExt)) {
        return false;
      }
    }

    // Optional: Check file size
    if (config.maxFileSize) {
      const stats = await fs.stat(resolvedFilePath);
      if (stats.size > config.maxFileSize) {
        return false;
      }
    }

    return true;
  } catch (error) {
    // Any error (file not found, no access) means file is not allowed
    return false;
  }
}

/**
 * Safely resolve a file path within the CDN directory
 * @param requestedPath Path requested by the client
 * @param config CDN configuration
 * @returns Resolved safe file path or null if not allowed
 */
export async function resolveCDNFilePath(
  requestedPath: string, 
  config: CDNConfig
): Promise<string | null> {
  const safePath = path.join(config.rootDirectory, requestedPath);
  
  return await isFileAccessAllowed(safePath, config) 
    ? safePath 
    : null;
}