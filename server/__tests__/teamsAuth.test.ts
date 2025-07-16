import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import { users, teams } from '../../shared/schema';

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

describe('Team Routes Auth', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = { ...users[0], id: 'user_2jciVA3sAWwS8wR4m3mJmYgB3gE' };
    vi.spyOn(storage, 'getUser').mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not allow a Player to create a team', async () => {
    mockUser.role = 'player';
    const response = await request(app)
      .post('/api/teams')
      .send({ name: 'Test Team', sportId: 1 });
    expect(response.status).toBe(403);
  });

  it('should allow a Captain to create a team', async () => {
    mockUser.role = 'captain';
    vi.spyOn(storage, 'createTeam').mockResolvedValue({ ...teams[0], id: 1, name: 'Test Team', sportId: 1, captainId: mockUser.id });
    const response = await request(app)
      .post('/api/teams')
      .send({ name: 'Test Team', sportId: 1 });
    expect(response.status).toBe(200);
  });

  it('should not allow a Captain to update another captain\'s team', async () => {
    mockUser.role = 'captain';
    vi.spyOn(storage, 'getTeam').mockResolvedValue({ ...teams[0], id: 1, captainId: 'another_captain_id' });
    const response = await request(app)
      .put('/api/teams/1')
      .send({ name: 'New Name' });
    expect(response.status).toBe(403);
  });

  it('should allow an Admin to update any team', async () => {
    mockUser.role = 'admin';
    vi.spyOn(storage, 'getTeam').mockResolvedValue({ ...teams[0], id: 1, captainId: 'another_captain_id' });
    vi.spyOn(storage, 'updateTeam').mockResolvedValue({ ...teams[0], id: 1, name: 'New Name' });
    const response = await request(app)
      .put('/api/teams/1')
      .send({ name: 'New Name' });
    expect(response.status).toBe(200);
  });

  it('should not allow a Player to add members to a team', async () => {
    mockUser.role = 'player';
    vi.spyOn(storage, 'getTeam').mockResolvedValue({ ...teams[0], id: 1, captainId: 'another_captain_id' });
    const response = await request(app)
      .post('/api/teams/1/members')
      .send({ userId: 'some_user_id' });
    expect(response.status).toBe(403);
  });
});
