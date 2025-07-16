import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { storage } from '../storage';
import { USER_ROLES, User } from '../../shared/schema';

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

process.env.STRIPE_SECRET_KEY = 'sk_test';

describe('game route authorization', () => {
  const userRoles: Record<string, string> = {};
  let app: express.Express;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());

    vi.spyOn(storage, 'getUser').mockImplementation(async (id: string): Promise<User | undefined> => {
      const role = userRoles[id] || USER_ROLES.PLAYER;
      return { id, role } as User;
    });
    vi.spyOn(storage, 'getTeam').mockResolvedValue({ id: 1, name: 'test', sportId: 1, captainId: 'test', division: 'A', gender: 'co-ed' });
    vi.spyOn(storage, 'createGame').mockResolvedValue({ id: 1, sportId: 1, homeTeamId: 1, awayTeamId: 2, scheduledAt: new Date() });
    vi.spyOn(storage, 'updateGame').mockResolvedValue({ id: 1, sportId: 1, homeTeamId: 1, awayTeamId: 2, scheduledAt: new Date() });
    vi.spyOn(storage, 'deleteGame').mockResolvedValue();

    server = await registerRoutes(app);
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
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());

    vi.spyOn(storage, 'getUser').mockImplementation(async (id: string): Promise<User | undefined> => {
      const role = userRoles[id] || USER_ROLES.PLAYER;
      return { id, role } as User;
    });
    vi.spyOn(storage, 'getTeam').mockResolvedValue({ id: 1, name: 'test', sportId: 1, captainId: 'test', division: 'A', gender: 'co-ed' });
    vi.spyOn(storage, 'createGame').mockResolvedValue({ id: 1, sportId: 1, homeTeamId: 1, awayTeamId: 2, scheduledAt: new Date() });
    vi.spyOn(storage, 'updateGame').mockResolvedValue({ id: 1, sportId: 1, homeTeamId: 1, awayTeamId: 2, scheduledAt: new Date() });
    vi.spyOn(storage, 'deleteGame').mockResolvedValue();

    server = await registerRoutes(app);
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
