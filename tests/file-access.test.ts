import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { createCDNConfig } from '../src/config/cdn.config';
import { 
  isFileAccessAllowed, 
  resolveCDNFilePath 
} from '../src/utils/file-access';

describe('CDN Directory Restrictions', () => {
  let testCDNDir: string;
  let config: ReturnType<typeof createCDNConfig>;
  
  beforeAll(async () => {
    // Create a unique test CDN directory
    testCDNDir = path.join(process.cwd(), 'tests', 'cdn_test_files');
    await fs.mkdir(testCDNDir, { recursive: true });
    
    // Create configuration with the test directory
    config = createCDNConfig({ rootDirectory: testCDNDir });
    
    // Create some test files
    await Promise.all([
      fs.writeFile(path.join(testCDNDir, 'test.txt'), 'Test content'),
      fs.writeFile(path.join(testCDNDir, 'image.jpg'), 'Fake image data')
    ]);
  });

  describe('isFileAccessAllowed', () => {
    it('should allow files within CDN directory', async () => {
      const testFilePath = path.join(testCDNDir, 'test.txt');
      
      const result = await isFileAccessAllowed(testFilePath, config);
      expect(result).toBe(true);
    });

    it('should reject files outside CDN directory', async () => {
      const outsideFilePath = path.join(process.cwd(), 'outside.txt');
      
      const result = await isFileAccessAllowed(outsideFilePath, config);
      expect(result).toBe(false);
    });

    it('should reject files with disallowed extensions', async () => {
      const configWithRestrictions = createCDNConfig({
        rootDirectory: testCDNDir,
        allowedFileExtensions: ['.txt']
      });
      const testFilePath = path.join(testCDNDir, 'image.jpg');
      
      const result = await isFileAccessAllowed(testFilePath, configWithRestrictions);
      expect(result).toBe(false);
    });
  });

  describe('resolveCDNFilePath', () => {
    it('should resolve allowed file paths', async () => {
      const result = await resolveCDNFilePath('test.txt', config);
      
      expect(result).toBe(path.join(testCDNDir, 'test.txt'));
    });

    it('should return null for files outside CDN directory', async () => {
      const result = await resolveCDNFilePath('../outside.txt', config);
      
      expect(result).toBeNull();
    });
  });
});