import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

// This is hoisted and runs before imports, setting the required environment variable.
vi.hoisted(() => {
  process.env.DATABASE_URL = 'dummy-db-url-for-testing';
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
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
import type { User } from '../../shared/schema';
import { USER_ROLES } from '../../shared/schema';
import type { Server } from 'http';

vi.mock('@clerk/clerk-sdk-node', () => ({
  ClerkExpressWithAuth: () => (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.header('x-user-id');
    req.auth = { userId };
    next();
  }
}));

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { userId?: string }; // for TypeScript compatibility
  }
}



describe('game route authorization', () => {
  const userRoles: Record<string, string> = {};
  let app: express.Express;
  let server: Server;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    vi.spyOn(storage, 'getUser').mockImplementation((id: string): Promise<User | undefined> => {
      const role = userRoles[id] || USER_ROLES.PLAYER;
      return Promise.resolve({ id, role } as User);
    });
    vi.spyOn(storage, 'getTeam').mockResolvedValue({ id: 1, name: 'test', sportId: 1, captainId: 'test', division: 'A', gender: 'co-ed', profileImageUrl: null, createdAt: new Date(), updatedAt: new Date(), points: 0, status: 'active', wins: 0, losses: 0, draws: 0, paymentStatus: 'paid', captainOnlyInvites: false, stripePaymentIntentId: null });
    vi.spyOn(storage, 'createGame').mockResolvedValue({ id: 1, sportId: 1, homeTeamId: 1, awayTeamId: 2, scheduledAt: new Date(), createdAt: new Date(), updatedAt: new Date(), status: 'scheduled', gender: 'co-ed', venue: null, homeScore: null, awayScore: null, winnerId: null, notes: null });
    vi.spyOn(storage, 'updateGame').mockResolvedValue({ id: 1, sportId: 1, homeTeamId: 1, awayTeamId: 2, scheduledAt: new Date(), createdAt: new Date(), updatedAt: new Date(), status: 'scheduled', gender: 'co-ed', venue: null, homeScore: null, awayScore: null, winnerId: null, notes: null });
    vi.spyOn(storage, 'deleteGame').mockResolvedValue();

    server = registerRoutes(app);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    server.close();
  });

  const body = {
    sportId: 1,
    homeTeamId: 1,
    awayTeamId: 2,
    scheduledAt: new Date().toISOString(),
    gender: 'co-ed'
  };

  it('rejects unauthenticated user', async () => {
    const res = await request(app).post('/api/games').send(body);
    expect(res.status).toBe(401);
  });

  it('rejects player user', async () => {
    userRoles['player1'] = USER_ROLES.PLAYER;
    const res = await request(app).post('/api/games').set('x-user-id', 'player1').send(body);
    expect(res.status).toBe(403);
  });

  it('allows referee user', async () => {
    userRoles['ref1'] = USER_ROLES.REFEREE;
    const res = await request(app).post('/api/games').set('x-user-id', 'ref1').send(body);
    expect(res.status).toBe(200);
  });

  it('allows admin user', async () => {
    userRoles['admin1'] = USER_ROLES.ADMIN;
    const res = await request(app).post('/api/games').set('x-user-id', 'admin1').send(body);
    expect(res.status).toBe(200);
  });
});

describe('game update and delete authorization', () => {
  const userRoles: Record<string, string> = {};
  let app: express.Express;
  let server: Server;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    vi.spyOn(storage, 'getUser').mockImplementation((id: string): Promise<User | undefined> => {
      const role = userRoles[id] || USER_ROLES.PLAYER;
      return Promise.resolve({ id, role } as User);
    });
    vi.spyOn(storage, 'getTeam').mockResolvedValue({ id: 1, name: 'test', sportId: 1, captainId: 'test', division: 'A', gender: 'co-ed', profileImageUrl: null, createdAt: new Date(), updatedAt: new Date(), points: 0, status: 'active', wins: 0, losses: 0, draws: 0, paymentStatus: 'paid', captainOnlyInvites: false, stripePaymentIntentId: null });
    vi.spyOn(storage, 'createGame').mockResolvedValue({ id: 1, sportId: 1, homeTeamId: 1, awayTeamId: 2, scheduledAt: new Date(), createdAt: new Date(), updatedAt: new Date(), status: 'scheduled', gender: 'co-ed', venue: null, homeScore: null, awayScore: null, winnerId: null, notes: null });
    vi.spyOn(storage, 'updateGame').mockResolvedValue({ id: 1, sportId: 1, homeTeamId: 1, awayTeamId: 2, scheduledAt: new Date(), createdAt: new Date(), updatedAt: new Date(), status: 'scheduled', gender: 'co-ed', venue: null, homeScore: null, awayScore: null, winnerId: null, notes: null });
    vi.spyOn(storage, 'deleteGame').mockResolvedValue();

    server = registerRoutes(app);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    server.close();
  });

  const body = {
    sportId: 1,
    homeTeamId: 1,
    awayTeamId: 2,
    scheduledAt: new Date().toISOString(),
    gender: 'co-ed'
  };

  it('PUT rejects player', async () => {
    userRoles['player2'] = USER_ROLES.PLAYER;
    const res = await request(app).put('/api/games/1').set('x-user-id', 'player2').send(body);
    expect(res.status).toBe(403);
  });

  it('DELETE rejects unauthenticated', async () => {
    const res = await request(app).delete('/api/games/1');
    expect(res.status).toBe(401);
  });

  it('PUT allows referee', async () => {
    userRoles['ref2'] = USER_ROLES.REFEREE;
    const res = await request(app).put('/api/games/1').set('x-user-id', 'ref2').send(body);
    expect(res.status).toBe(200);
  });

  it('DELETE allows admin', async () => {
    userRoles['admin2'] = USER_ROLES.ADMIN;
    const res = await request(app).delete('/api/games/1').set('x-user-id', 'admin2');
    expect(res.status).toBe(200);
  });
});
