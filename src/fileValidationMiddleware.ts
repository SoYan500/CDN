import path from 'path';
import fs from 'fs';

/**
 * Middleware to validate file path security
 * Prevents directory traversal and ensures file is within CDN directory
 * 
 * @param cdnDirectory Base directory for allowed file access
 * @returns Express middleware function
 */
export const createFileValidationMiddleware = (cdnDirectory: string) => {
  return (req, res, next) => {
    try {
      // Get the requested file path
      const requestedPath = req.params.filePath || req.query.file;
      
      if (!requestedPath) {
        return res.status(400).json({ 
          error: 'No file path provided' 
        });
      }

      // Normalize and resolve paths to prevent directory traversal
      const normalizedRequestedPath = path.normalize(requestedPath);
      const absoluteCdnPath = path.resolve(cdnDirectory);
      const absoluteFilePath = path.resolve(cdnDirectory, normalizedRequestedPath);

      // Security check: Ensure file is within CDN directory
      if (!absoluteFilePath.startsWith(absoluteCdnPath)) {
        return res.status(403).json({ 
          error: 'Access denied: File outside of CDN directory' 
        });
      }

      // Check if file actually exists
      if (!fs.existsSync(absoluteFilePath)) {
        return res.status(404).json({ 
          error: 'File not found' 
        });
      }

      // Check if it's a file, not a directory
      const stats = fs.statSync(absoluteFilePath);
      if (!stats.isFile()) {
        return res.status(400).json({ 
          error: 'Invalid file type' 
        });
      }

      // Attach validated file path to request for subsequent middleware
      req.validatedFilePath = absoluteFilePath;
      next();
    } catch (error) {
      console.error('File validation error:', error);
      res.status(500).json({ 
        error: 'Internal server error during file validation' 
      });
    }
  };
};