import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// This is hoisted and runs before imports, setting the required environment variable.
vi.hoisted(() => {
  process.env.DATABASE_URL = 'dummy-db-url-for-testing';
});

// Mock the postgres library to prevent it from trying to connect to a database.
vi.mock('postgres', () => {
    const mClient = {
        query: vi.fn(),
        end: vi.fn(),
    };
    const mPostgres = vi.fn(() => mClient);
    return { default: mPostgres };
});

// Mock drizzle-orm
vi.mock('drizzle-orm/postgres-js', () => {
  return {
    drizzle: vi.fn().mockReturnValue({}), // Return a dummy object
  };
});

import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import type { User, Sport } from '../../shared/schema';

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

describe('Sports Routes Auth', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = { id: 'user_2jciVA3sAWwS8wR4m3mJmYgB3gE', role: 'player', email: 'test@test.com', firstName: 'test', lastName: 'test', profileImageUrl: null, stripeCustomerId: null, stripeSubscriptionId: null, onboardingCompleted: false, interests: [], experience: null, availability: null, notifications: true, createdAt: new Date(), updatedAt: new Date() };
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
    const mockSport: Sport = { id: 1, name: 'Test Sport', description: null, gender: 'co-ed', maxTeams: null, maxPlayersPerTeam: null, minPlayersPerTeam: null, teamFee: null, registrationDeadline: null, startDate: null, endDate: null, status: 'active', createdAt: new Date(), updatedAt: new Date() };
    vi.spyOn(storage, 'createSport').mockResolvedValue(mockSport);
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
    const mockSport: Sport = { id: 1, name: 'New Name', description: null, gender: 'co-ed', maxTeams: null, maxPlayersPerTeam: null, minPlayersPerTeam: null, teamFee: null, registrationDeadline: null, startDate: null, endDate: null, status: 'active', createdAt: new Date(), updatedAt: new Date() };
    vi.spyOn(storage, 'updateSport').mockResolvedValue(mockSport);
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
