import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { createCDNConfig } from '../src/config/cdn.config';
import { 
  isFileAccessAllowed, 
  resolveCDNFilePath 
} from '../src/utils/file-access';

describe('CDN Directory Restrictions', () => {
  const testCDNDir = path.join(process.cwd(), 'cdn_files');
  
  beforeAll(async () => {
    // Ensure test CDN directory exists
    await fs.mkdir(testCDNDir, { recursive: true });
    
    // Create some test files
    await Promise.all([
      fs.writeFile(path.join(testCDNDir, 'test.txt'), 'Test content'),
      fs.writeFile(path.join(testCDNDir, 'image.jpg'), 'Fake image data'),
      fs.writeFile(path.join(testCDNDir, 'outside.txt'), 'Outside content', { 
        mode: 0o755 
      })
    ]);
  });

  describe('isFileAccessAllowed', () => {
    it('should allow files within CDN directory', async () => {
      const config = createCDNConfig();
      const testFilePath = path.join(testCDNDir, 'test.txt');
      
      const result = await isFileAccessAllowed(testFilePath, config);
      expect(result).toBe(true);
    });

    it('should reject files outside CDN directory', async () => {
      const config = createCDNConfig();
      const outsideFilePath = path.join(process.cwd(), 'outside.txt');
      
      const result = await isFileAccessAllowed(outsideFilePath, config);
      expect(result).toBe(false);
    });

    it('should reject files with disallowed extensions', async () => {
      const config = createCDNConfig({
        allowedFileExtensions: ['.txt']
      });
      const testFilePath = path.join(testCDNDir, 'image.jpg');
      
      const result = await isFileAccessAllowed(testFilePath, config);
      expect(result).toBe(false);
    });
  });

  describe('resolveCDNFilePath', () => {
    it('should resolve allowed file paths', async () => {
      const config = createCDNConfig();
      const result = await resolveCDNFilePath('test.txt', config);
      
      expect(result).toBe(path.join(testCDNDir, 'test.txt'));
    });

    it('should return null for files outside CDN directory', async () => {
      const config = createCDNConfig();
      const result = await resolveCDNFilePath('../outside.txt', config);
      
      expect(result).toBeNull();
    });
  });
});