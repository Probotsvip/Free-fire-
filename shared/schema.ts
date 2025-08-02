import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameEnum = pgEnum("game", ["PUBG", "FREE_FIRE"]);
export const tournamentStatusEnum = pgEnum("tournament_status", ["upcoming", "live", "completed", "cancelled"]);
export const gameModeEnum = pgEnum("game_mode", ["solo", "duo", "squad"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  tournamentsWon: integer("tournaments_won").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  game: gameEnum("game").notNull(),
  gameMode: gameModeEnum("game_mode").notNull(),
  map: text("map").notNull(),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).notNull(),
  entryFee: decimal("entry_fee", { precision: 10, scale: 2 }).notNull(),
  maxPlayers: integer("max_players").notNull(),
  currentPlayers: integer("current_players").notNull().default(0),
  status: tournamentStatusEnum("status").notNull().default("upcoming"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  firstPrize: decimal("first_prize", { precision: 10, scale: 2 }).notNull(),
  secondPrize: decimal("second_prize", { precision: 10, scale: 2 }).notNull(),
  thirdPrize: decimal("third_prize", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  position: integer("position"),
  kills: integer("kills").default(0),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).default("0"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdraw, entry_fee, prize_money
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  currentPlayers: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  registeredAt: true,
  position: true,
  kills: true,
  earnings: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
