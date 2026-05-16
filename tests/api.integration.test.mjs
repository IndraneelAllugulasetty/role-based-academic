import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app;

beforeAll(async () => {
  const mod = await import('../server/app.js');
  app = mod.default;
});

describe('HTTP API', () => {
  it('GET /api/announcements returns seeded announcements', async () => {
    const res = await request(app).get('/api/announcements').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/events returns seeded events', async () => {
    const res = await request(app).get('/api/events').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login succeeds with seeded admin (password123)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@college.edu', password: 'password123' })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.token).toBeTruthy();
    expect(res.body.data?.user?.email).toBe('admin@college.edu');
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@college.edu', password: 'wrong-password' })
      .expect(401);
    expect(res.body.success).toBe(false);
  });
});
