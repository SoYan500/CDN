import path from 'path';

/**
 * CDN Configuration for file serving
 */
export interface CDNConfig {
  rootDirectory: string;
  allowedFileExtensions?: string[];
  maxFileSize?: number;
}

/**
 * Default CDN Configuration
 */
export const defaultCDNConfig: CDNConfig = {
  rootDirectory: path.join(process.cwd(), 'cdn_files'),
  allowedFileExtensions: [
    '.txt', '.pdf', '.jpg', '.jpeg', '.png', '.gif', 
    '.mp4', '.mp3', '.csv', '.json', '.xml'
  ],
  maxFileSize: 50 * 1024 * 1024 // 50MB default max file size
};

/**
 * Create a CDN configuration with optional overrides
 * @param config Partial configuration to override defaults
 * @returns Complete CDN configuration
 */
export function createCDNConfig(config: Partial<CDNConfig> = {}): CDNConfig {
  return {
    ...defaultCDNConfig,
    ...config,
    // Ensure rootDirectory is an absolute path
    rootDirectory: path.isAbsolute(config.rootDirectory || '') 
      ? config.rootDirectory || defaultCDNConfig.rootDirectory
      : path.join(process.cwd(), config.rootDirectory || defaultCDNConfig.rootDirectory)
  };
}