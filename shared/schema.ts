import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const teamInvitationType = pgEnum('team_invitation_type', ['invite', 'request']);
export const teamInvitationStatus = pgEnum('team_invitation_status', ['pending', 'accepted', 'declined']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("player"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  interests: text("interests").array(),
  experience: varchar("experience"),
  availability: varchar("availability"),
  notifications: boolean("notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sports = pgTable("sports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  gender: varchar("gender", { length: 20 }).default("co-ed").notNull(),
  maxTeams: integer("max_teams"),
  maxPlayersPerTeam: integer("max_players_per_team"),
  minPlayersPerTeam: integer("min_players_per_team"),
  teamFee: decimal("team_fee", { precision: 10, scale: 2 }),
  registrationDeadline: timestamp("registration_deadline"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  sportId: integer("sport_id").references(() => sports.id).notNull(),
  captainId: varchar("captain_id").references(() => users.id).notNull(),
  profileImageUrl: varchar("profile_image_url"),
  captainOnlyInvites: boolean("captain_only_invites").default(true).notNull(),
  gender: varchar("gender", { length: 20 }).default("co-ed").notNull(),
  division: varchar("division", { length: 50 }),
  status: varchar("status", { length: 20 }).default("active"),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  draws: integer("draws").default(0),
  points: integer("points").default(0),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 20 }).default("player"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const teamInvitations = pgTable("team_invitations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: teamInvitationType("type").notNull(),
  status: teamInvitationStatus("status").default("pending").notNull(),
  invitedBy: varchar("invited_by").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  sportId: integer("sport_id").references(() => sports.id).notNull(),
  homeTeamId: integer("home_team_id").references(() => teams.id).notNull(),
  awayTeamId: integer("away_team_id").references(() => teams.id).notNull(),
  gender: varchar("gender", { length: 20 }).default("co-ed").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  venue: varchar("venue", { length: 100 }),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: varchar("status", { length: 20 }).default("scheduled"),
  winnerId: integer("winner_id").references(() => teams.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  captainedTeams: many(teams, { relationName: "captain" }),
  teamMemberships: many(teamMembers),
  teamInvitations: many(teamInvitations),
}));

export const sportsRelations = relations(sports, ({ many }) => ({
  teams: many(teams),
  games: many(games),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  sport: one(sports, {
    fields: [teams.sportId],
    references: [sports.id],
  }),
  captain: one(users, {
    fields: [teams.captainId],
    references: [users.id],
    relationName: "captain",
  }),
  members: many(teamMembers),
  invitations: many(teamInvitations),
  homeGames: many(games, { relationName: "homeTeam" }),
  awayGames: many(games, { relationName: "awayTeam" }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const teamInvitationsRelations = relations(teamInvitations, ({ one }) => ({
  team: one(teams, {
    fields: [teamInvitations.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamInvitations.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [teamInvitations.invitedBy],
    references: [users.id],
    relationName: 'inviter'
  }),
}));

export const gamesRelations = relations(games, ({ one }) => ({
  sport: one(sports, {
    fields: [games.sportId],
    references: [sports.id],
  }),
  homeTeam: one(teams, {
    fields: [games.homeTeamId],
    references: [teams.id],
    relationName: "homeTeam",
  }),
  awayTeam: one(teams, {
    fields: [games.awayTeamId],
    references: [teams.id],
    relationName: "awayTeam",
  }),
  winner: one(teams, {
    fields: [games.winnerId],
    references: [teams.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSportSchema = createInsertSchema(sports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledAt: z.string().transform((val) => new Date(val)),
});

export const USER_ROLES = {
  ADMIN: 'admin',
  CAPTAIN: 'captain',
  PLAYER: 'player',
  REFEREE: 'referee'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Sport = typeof sports.$inferSelect;
export type InsertSport = z.infer<typeof insertSportSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;