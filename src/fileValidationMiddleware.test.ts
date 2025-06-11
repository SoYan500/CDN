import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import { createFileValidationMiddleware } from './fileValidationMiddleware';

// Mock fs and path to control test scenarios
vi.mock('fs');
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    resolve: vi.fn((base, file) => {
      if (!file) return base;
      return `${base}/${file}`;
    }),
  };
});

describe('File Validation Middleware', () => {
  const mockCdnDirectory = '/mock/cdn/directory';

  const createMockRequest = (filePath: string) => ({
    params: { filePath },
    query: { file: filePath },
    validatedFilePath: null
  });

  const createMockResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  });

  const createMockNext = vi.fn();

  it('should allow valid file within CDN directory', () => {
    // Simulate file exists and is a file
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ 
      isFile: () => true 
    } as any);

    const middleware = createFileValidationMiddleware(mockCdnDirectory);
    const req = createMockRequest('valid-file.txt');
    const res = createMockResponse();
    const next = createMockNext;

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedFilePath).toBe(`${mockCdnDirectory}/valid-file.txt`);
  });

  it('should reject file path with directory traversal', () => {
    const middleware = createFileValidationMiddleware(mockCdnDirectory);
    const req = createMockRequest('../outside-directory.txt');
    const res = createMockResponse();
    const next = createMockNext;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Access denied: File outside of CDN directory' 
    });
  });

  it('should reject non-existent files', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const middleware = createFileValidationMiddleware(mockCdnDirectory);
    const req = createMockRequest('non-existent.txt');
    const res = createMockResponse();
    const next = createMockNext;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'File not found' 
    });
  });

  it('should reject directories', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ 
      isFile: () => false 
    } as any);

    const middleware = createFileValidationMiddleware(mockCdnDirectory);
    const req = createMockRequest('directory');
    const res = createMockResponse();
    const next = createMockNext;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Invalid file type' 
    });
  });

  it('should handle missing file path', () => {
    const middleware = createFileValidationMiddleware(mockCdnDirectory);
    const req = { params: {}, query: {} };
    const res = createMockResponse();
    const next = createMockNext;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'No file path provided' 
    });
  });
});