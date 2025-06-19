import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('Health Check Endpoint', () => {
  it('should return 200 OK with health information', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('message', 'CDN Management Server is running smoothly');
  });
});