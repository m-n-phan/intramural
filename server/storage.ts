import {
  users,
  sports,
  teams,
  teamMembers,
  games,
  type User,
  type UpsertUser,
  type Sport,
  type InsertSport,
  type Team,
  type InsertTeam,
  type TeamMember,
  type InsertTeamMember,
  type Game,
  type InsertGame,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Sport operations
  getSports(): Promise<Sport[]>;
  getSport(id: number): Promise<Sport | undefined>;
  createSport(sport: InsertSport): Promise<Sport>;
  updateSport(id: number, sport: Partial<InsertSport>): Promise<Sport>;
  deleteSport(id: number): Promise<void>;
  
  // Team operations
  getTeams(): Promise<Team[]>;
  getTeamsBySport(sportId: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  
  // Team member operations
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: number, userId: string): Promise<void>;
  
  // Game operations
  getGames(): Promise<Game[]>;
  getGamesBySport(sportId: number): Promise<Game[]>;
  getUpcomingGames(): Promise<Game[]>;
  getRecentGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game>;
  deleteGame(id: number): Promise<void>;
  
  // Analytics operations
  getTeamStats(): Promise<any>;
  getParticipationStats(): Promise<any>;
  getRevenueStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Sport operations
  async getSports(): Promise<Sport[]> {
    return await db.select().from(sports).orderBy(asc(sports.name));
  }

  async getSport(id: number): Promise<Sport | undefined> {
    const [sport] = await db.select().from(sports).where(eq(sports.id, id));
    return sport;
  }

  async createSport(sport: InsertSport): Promise<Sport> {
    const [newSport] = await db.insert(sports).values(sport).returning();
    return newSport;
  }

  async updateSport(id: number, sport: Partial<InsertSport>): Promise<Sport> {
    const [updatedSport] = await db
      .update(sports)
      .set({ ...sport, updatedAt: new Date() })
      .where(eq(sports.id, id))
      .returning();
    return updatedSport;
  }

  async deleteSport(id: number): Promise<void> {
    await db.delete(sports).where(eq(sports.id, id));
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(asc(teams.name));
  }

  async getTeamsBySport(sportId: number): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.sportId, sportId))
      .orderBy(desc(teams.points), desc(teams.wins));
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team> {
    const [updatedTeam] = await db
      .update(teams)
      .set({ ...team, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  // Team member operations
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId))
      .orderBy(asc(teamMembers.joinedAt));
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }

  async removeTeamMember(teamId: number, userId: string): Promise<void> {
    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      );
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(desc(games.scheduledAt));
  }

  async getGamesBySport(sportId: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.sportId, sportId))
      .orderBy(desc(games.scheduledAt));
  }

  async getUpcomingGames(): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(
        and(
          eq(games.status, "scheduled"),
          sql`${games.scheduledAt} > NOW()`
        )
      )
      .orderBy(asc(games.scheduledAt))
      .limit(10);
  }

  async getRecentGames(): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.status, "completed"))
      .orderBy(desc(games.scheduledAt))
      .limit(10);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async updateGame(id: number, game: Partial<InsertGame>): Promise<Game> {
    const [updatedGame] = await db
      .update(games)
      .set({ ...game, updatedAt: new Date() })
      .where(eq(games.id, id))
      .returning();
    return updatedGame;
  }

  async deleteGame(id: number): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  // Analytics operations
  async getTeamStats(): Promise<any> {
    const [result] = await db
      .select({
        totalTeams: count(teams.id),
      })
      .from(teams);
    return result;
  }

  async getParticipationStats(): Promise<any> {
    const [result] = await db
      .select({
        totalPlayers: count(teamMembers.id),
      })
      .from(teamMembers);
    return result;
  }

  async getRevenueStats(): Promise<any> {
    const [result] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${sports.teamFee}), 0)`,
        paidTeams: count(sql`CASE WHEN ${teams.paymentStatus} = 'paid' THEN 1 END`),
        pendingRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${teams.paymentStatus} = 'pending' THEN ${sports.teamFee} END), 0)`,
      })
      .from(teams)
      .leftJoin(sports, eq(teams.sportId, sports.id));
    return result;
  }
}

export const storage = new DatabaseStorage();
