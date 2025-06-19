import crypto from 'crypto';

interface ApiKey {
    key: string;
    createdAt: Date;
    permissions: string[];
}

export class ApiKeyManager {
    private apiKeys: Map<string, ApiKey> = new Map();

    // Generate a new secure API key
    generateApiKey(permissions: string[] = []): string {
        const apiKey = crypto.randomBytes(32).toString('hex');
        const keyEntry: ApiKey = {
            key: apiKey,
            createdAt: new Date(),
            permissions
        };
        this.apiKeys.set(apiKey, keyEntry);
        return apiKey;
    }

    // Validate an API key
    validateApiKey(apiKey: string): boolean {
        return this.apiKeys.has(apiKey);
    }

    // Get permissions for a specific API key
    getApiKeyPermissions(apiKey: string): string[] | null {
        const keyEntry = this.apiKeys.get(apiKey);
        return keyEntry ? keyEntry.permissions : null;
    }

    // Remove an API key
    revokeApiKey(apiKey: string): boolean {
        return this.apiKeys.delete(apiKey);
    }

    // Clear all API keys (use with caution)
    clearAllApiKeys(): void {
        this.apiKeys.clear();
    }

    // Get the number of active API keys
    getActiveKeyCount(): number {
        return this.apiKeys.size;
    }
}

export default new ApiKeyManager();