import crypto from 'crypto';

interface ApiKeyConfig {
  id: string;
  key: string;
  permissions: string[];
}

class ApiKeyManager {
  private apiKeys: Map<string, ApiKeyConfig>;

  constructor() {
    this.apiKeys = new Map();
  }

  // Generate a secure API key
  generateApiKey(permissions: string[] = []): ApiKeyConfig {
    const id = this.generateUniqueId();
    const key = this.generateRandomKey();

    const apiKeyConfig: ApiKeyConfig = {
      id,
      key,
      permissions
    };

    this.apiKeys.set(id, apiKeyConfig);
    return apiKeyConfig;
  }

  // Validate an API key
  validateApiKey(id: string, key: string): boolean {
    const apiKey = this.apiKeys.get(id);
    return !!apiKey && apiKey.key === key;
  }

  // Get permissions for a valid API key
  getApiKeyPermissions(id: string, key: string): string[] | null {
    if (this.validateApiKey(id, key)) {
      return this.apiKeys.get(id)!.permissions;
    }
    return null;
  }

  // Check if an API key has a specific permission
  hasPermission(id: string, key: string, requiredPermission: string): boolean {
    const permissions = this.getApiKeyPermissions(id, key);
    return !!permissions && permissions.includes(requiredPermission);
  }

  // Revoke an API key
  revokeApiKey(id: string): boolean {
    return this.apiKeys.delete(id);
  }

  // Private method to generate a unique ID
  private generateUniqueId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Private method to generate a secure random key
  private generateRandomKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Clear all API keys (useful for testing)
  clearAllApiKeys(): void {
    this.apiKeys.clear();
  }
}

export { ApiKeyManager, ApiKeyConfig };