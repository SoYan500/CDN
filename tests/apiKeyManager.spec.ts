import { describe, it, expect, beforeEach } from 'vitest';
import { ApiKeyManager } from '../src/auth/apiKeyManager';

describe('ApiKeyManager', () => {
    let apiKeyManager: ApiKeyManager;

    beforeEach(() => {
        apiKeyManager = new ApiKeyManager();
    });

    it('should generate a unique API key', () => {
        const apiKey1 = apiKeyManager.generateApiKey();
        const apiKey2 = apiKeyManager.generateApiKey();

        expect(apiKey1).toBeDefined();
        expect(apiKey2).toBeDefined();
        expect(apiKey1).not.toEqual(apiKey2);
    });

    it('should validate a generated API key', () => {
        const apiKey = apiKeyManager.generateApiKey();
        
        expect(apiKeyManager.validateApiKey(apiKey)).toBeTruthy();
    });

    it('should invalidate a non-existing API key', () => {
        const fakeKey = 'fake-key-123';
        
        expect(apiKeyManager.validateApiKey(fakeKey)).toBeFalsy();
    });

    it('should allow setting permissions for an API key', () => {
        const permissions = ['read', 'write'];
        const apiKey = apiKeyManager.generateApiKey(permissions);
        
        const retrievedPermissions = apiKeyManager.getApiKeyPermissions(apiKey);
        expect(retrievedPermissions).toEqual(permissions);
    });

    it('should revoke an API key', () => {
        const apiKey = apiKeyManager.generateApiKey();
        
        expect(apiKeyManager.revokeApiKey(apiKey)).toBeTruthy();
        expect(apiKeyManager.validateApiKey(apiKey)).toBeFalsy();
    });

    it('should track the number of active API keys', () => {
        apiKeyManager.generateApiKey();
        apiKeyManager.generateApiKey();
        
        expect(apiKeyManager.getActiveKeyCount()).toBe(2);
    });

    it('should clear all API keys', () => {
        apiKeyManager.generateApiKey();
        apiKeyManager.generateApiKey();
        
        apiKeyManager.clearAllApiKeys();
        expect(apiKeyManager.getActiveKeyCount()).toBe(0);
    });
});