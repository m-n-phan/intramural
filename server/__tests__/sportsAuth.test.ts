import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import { users, sports } from '../../shared/schema';

vi.mock('../storage');
vi.mock('@clerk/clerk-sdk-node', () => ({
  ClerkExpressWithAuth: () => (req, res, next) => {
    req.auth = { userId: 'user_2jciVA3sAWwS8wR4m3mJmYgB3gE' };
    next();
  },
}));

const app = express();
app.use(express.json());
registerRoutes(app);

describe('Sports Routes Auth', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = { ...users[0], id: 'user_2jciVA3sAWwS8wR4m3mJmYgB3gE' };
    vi.spyOn(storage, 'getUser').mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not allow a non-admin to create a sport', async () => {
    mockUser.role = 'player';
    const response = await request(app)
      .post('/api/sports')
      .send({ name: 'Test Sport' });
    expect(response.status).toBe(403);
  });

  it('should allow an admin to create a sport', async () => {
    mockUser.role = 'admin';
    vi.spyOn(storage, 'createSport').mockResolvedValue({ ...sports[0], id: 1, name: 'Test Sport' });
    const response = await request(app)
      .post('/api/sports')
      .send({ name: 'Test Sport' });
    expect(response.status).toBe(200);
  });

  it('should not allow a non-admin to update a sport', async () => {
    mockUser.role = 'player';
    const response = await request(app)
      .put('/api/sports/1')
      .send({ name: 'New Name' });
    expect(response.status).toBe(403);
  });

  it('should allow an admin to update a sport', async () => {
    mockUser.role = 'admin';
    vi.spyOn(storage, 'updateSport').mockResolvedValue({ ...sports[0], id: 1, name: 'New Name' });
    const response = await request(app)
      .put('/api/sports/1')
      .send({ name: 'New Name' });
    expect(response.status).toBe(200);
  });

  it('should not allow a non-admin to delete a sport', async () => {
    mockUser.role = 'player';
    const response = await request(app)
      .delete('/api/sports/1');
    expect(response.status).toBe(403);
  });

  it('should allow an admin to delete a sport', async () => {
    mockUser.role = 'admin';
    vi.spyOn(storage, 'deleteSport').mockResolvedValue(undefined);
    const response = await request(app)
      .delete('/api/sports/1');
    expect(response.status).toBe(200);
  });
});
