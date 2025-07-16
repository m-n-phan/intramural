import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import type { User, Team } from '../../shared/schema';

vi.mock('../storage');
vi.mock('@clerk/clerk-sdk-node', () => ({
  ClerkExpressWithAuth: () => (req: Request, res: Response, next: NextFunction) => {
    req.auth = { userId: 'user_2jciVA3sAWwS8wR4m3mJmYgB3gE' };
    next();
  },
}));

const app = express();
app.use(express.json());
registerRoutes(app);

describe('Team Routes Auth', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = { id: 'user_2jciVA3sAWwS8wR4m3mJmYgB3gE', role: 'player', email: 'test@test.com', firstName: 'test', lastName: 'test', profileImageUrl: null, stripeCustomerId: null, stripeSubscriptionId: null, onboardingCompleted: false, interests: [], experience: null, availability: null, notifications: true, createdAt: new Date(), updatedAt: new Date() };
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
    const mockTeam: Team = { id: 1, name: 'Test Team', sportId: 1, captainId: mockUser.id, division: 'A', gender: 'co-ed', profileImageUrl: null, createdAt: new Date(), updatedAt: new Date(), points: 0, status: 'active', wins: 0, losses: 0, draws: 0, paymentStatus: 'paid', captainOnlyInvites: false, stripePaymentIntentId: null };
    vi.spyOn(storage, 'createTeam').mockResolvedValue(mockTeam);
    const response = await request(app)
      .post('/api/teams')
      .send({ name: 'Test Team', sportId: 1 });
    expect(response.status).toBe(200);
  });

  it("should not allow a Captain to update another captain's team", async () => {
    mockUser.role = 'captain';
    const mockTeam: Team = { id: 1, name: 'Test Team', sportId: 1, captainId: 'another_captain_id', division: 'A', gender: 'co-ed', profileImageUrl: null, createdAt: new Date(), updatedAt: new Date(), points: 0, status: 'active', wins: 0, losses: 0, draws: 0, paymentStatus: 'paid', captainOnlyInvites: false, stripePaymentIntentId: null };
    vi.spyOn(storage, 'getTeam').mockResolvedValue(mockTeam);
    const response = await request(app)
      .put('/api/teams/1')
      .send({ name: 'New Name' });
    expect(response.status).toBe(403);
  });

  it('should allow an Admin to update any team', async () => {
    mockUser.role = 'admin';
    const mockTeam: Team = { id: 1, name: 'Test Team', sportId: 1, captainId: 'another_captain_id', division: 'A', gender: 'co-ed', profileImageUrl: null, createdAt: new Date(), updatedAt: new Date(), points: 0, status: 'active', wins: 0, losses: 0, draws: 0, paymentStatus: 'paid', captainOnlyInvites: false, stripePaymentIntentId: null };
    vi.spyOn(storage, 'getTeam').mockResolvedValue(mockTeam);
    vi.spyOn(storage, 'updateTeam').mockResolvedValue({ ...mockTeam, name: 'New Name' });
    const response = await request(app)
      .put('/api/teams/1')
      .send({ name: 'New Name' });
    expect(response.status).toBe(200);
  });

  it('should not allow a Player to add members to a team', async () => {
    mockUser.role = 'player';
    const mockTeam: Team = { id: 1, name: 'Test Team', sportId: 1, captainId: 'another_captain_id', division: 'A', gender: 'co-ed', profileImageUrl: null, createdAt: new Date(), updatedAt: new Date(), points: 0, status: 'active', wins: 0, losses: 0, draws: 0, paymentStatus: 'paid', captainOnlyInvites: false, stripePaymentIntentId: null };
    vi.spyOn(storage, 'getTeam').mockResolvedValue(mockTeam);
    const response = await request(app)
      .post('/api/teams/1/members')
      .send({ userId: 'some_user_id' });
    expect(response.status).toBe(403);
  });
});
