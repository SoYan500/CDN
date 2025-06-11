import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { safeReadFile, validateFilePath, FileAccessError } from '../src/file-access-error';
import fs from 'fs/promises';
import path from 'path';

describe('File Access Error Handling', () => {
  const testCdnDir = path.resolve(__dirname, '../test-cdn');

  // Setup: create test directory and a test file
  beforeAll(async () => {
    await fs.mkdir(testCdnDir, { recursive: true });
    await fs.writeFile(path.join(testCdnDir, 'test.txt'), 'Hello, World!');
  });

  // Cleanup: remove test directory
  afterAll(async () => {
    await fs.rm(testCdnDir, { recursive: true, force: true });
  });

  it('should read a valid file successfully', async () => {
    const content = await safeReadFile('test.txt', testCdnDir);
    expect(content.toString()).toBe('Hello, World!');
  });

  it('should throw FileAccessError for non-existent file', async () => {
    await expect(safeReadFile('nonexistent.txt', testCdnDir))
      .rejects.toThrow(FileAccessError);
  });

  it('should prevent directory traversal attacks', async () => {
    await expect(safeReadFile('../sensitive-file.txt', testCdnDir))
      .rejects.toThrow(FileAccessError);
  });

  it('should validate file path within CDN directory', () => {
    expect(() => validateFilePath('test.txt', testCdnDir)).not.toThrow();
    expect(() => validateFilePath('../outside.txt', testCdnDir)).toThrow(FileAccessError);
  });
});