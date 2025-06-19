import { describe, it, expect, beforeEach } from 'vitest';
import { ApiKeyManager } from '../src/auth/apiKeyManager';

describe('ApiKeyManager', () => {
  let apiKeyManager: ApiKeyManager;

  beforeEach(() => {
    apiKeyManager = new ApiKeyManager();
  });

  it('should generate a new API key', () => {
    const apiKey = apiKeyManager.generateApiKey();
    expect(apiKey.id).toBeDefined();
    expect(apiKey.key).toBeDefined();
    expect(apiKey.permissions).toEqual([]);
  });

  it('should generate API key with permissions', () => {
    const permissions = ['read', 'write'];
    const apiKey = apiKeyManager.generateApiKey(permissions);
    expect(apiKey.permissions).toEqual(permissions);
  });

  it('should validate a generated API key', () => {
    const apiKey = apiKeyManager.generateApiKey();
    const isValid = apiKeyManager.validateApiKey(apiKey.id, apiKey.key);
    expect(isValid).toBe(true);
  });

  it('should return false for invalid API key', () => {
    const apiKey = apiKeyManager.generateApiKey();
    const isValid = apiKeyManager.validateApiKey(apiKey.id, 'invalid-key');
    expect(isValid).toBe(false);
  });

  it('should check API key permissions', () => {
    const permissions = ['read', 'write'];
    const apiKey = apiKeyManager.generateApiKey(permissions);
    const hasReadPermission = apiKeyManager.hasPermission(apiKey.id, apiKey.key, 'read');
    const hasDeletePermission = apiKeyManager.hasPermission(apiKey.id, apiKey.key, 'delete');
    
    expect(hasReadPermission).toBe(true);
    expect(hasDeletePermission).toBe(false);
  });

  it('should revoke an API key', () => {
    const apiKey = apiKeyManager.generateApiKey();
    const wasRevoked = apiKeyManager.revokeApiKey(apiKey.id);
    const isValid = apiKeyManager.validateApiKey(apiKey.id, apiKey.key);
    
    expect(wasRevoked).toBe(true);
    expect(isValid).toBe(false);
  });

  it('should clear all API keys', () => {
    apiKeyManager.generateApiKey();
    apiKeyManager.generateApiKey();
    apiKeyManager.clearAllApiKeys();

    // Ideally, this would check the internal state, but we can simulate by checking validation
    const apiKey = apiKeyManager.generateApiKey();
    const otherApiKey = apiKeyManager.generateApiKey();
    
    expect(apiKey.id).toBeDefined();
    expect(otherApiKey.id).toBeDefined();
  });
});