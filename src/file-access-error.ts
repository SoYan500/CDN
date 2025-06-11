import fs from 'fs/promises';
import path from 'path';

export class FileAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileAccessError';
  }
}

export async function safeReadFile(filePath: string, cdnDir: string): Promise<Buffer> {
  try {
    // Normalize paths to prevent directory traversal
    const normalizedFilePath = path.normalize(filePath);
    const resolvedPath = path.resolve(cdnDir, normalizedFilePath);

    // Ensure file is within CDN directory
    if (!resolvedPath.startsWith(path.resolve(cdnDir))) {
      throw new FileAccessError('Access to file is not allowed');
    }

    // Check file accessibility
    await fs.access(resolvedPath, fs.constants.R_OK);

    // Read file
    return await fs.readFile(resolvedPath);
  } catch (error) {
    if (error instanceof Error) {
      if (error.code === 'ENOENT') {
        throw new FileAccessError('File not found');
      }
      if (error.code === 'EACCES') {
        throw new FileAccessError('Permission denied to access file');
      }
    }
    
    // Re-throw original error if it's a FileAccessError or unknown
    throw error;
  }
}

export function validateFilePath(filePath: string, cdnDir: string): void {
  const normalizedFilePath = path.normalize(filePath);
  const resolvedPath = path.resolve(cdnDir, normalizedFilePath);

  if (!resolvedPath.startsWith(path.resolve(cdnDir))) {
    throw new FileAccessError('Invalid file path');
  }
}