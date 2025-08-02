import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, pgEnum, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameEnum = pgEnum("game", ["PUBG", "FREE_FIRE"]);
export const tournamentStatusEnum = pgEnum("tournament_status", ["upcoming", "live", "completed", "cancelled"]);
export const gameModeEnum = pgEnum("game_mode", ["solo", "duo", "squad"]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdraw", "entry_fee", "prize_money", "bonus", "dil_reward", "spin_reward"]);
export const medalTypeEnum = pgEnum("medal_type", ["bronze", "silver", "gold", "platinum", "diamond"]);
export const rewardTypeEnum = pgEnum("reward_type", ["cash", "dil", "medal", "tournament_pass", "spin_ticket"]);

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  tournamentsWon: integer("tournaments_won").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  // Free Fire specific
  freeFireUid: text("free_fire_uid"),
  freeFireUsername: text("free_fire_username"),
  // Loyalty & Rewards
  dilBalance: integer("dil_balance").notNull().default(0), // Hearts/DIL
  totalDilEarned: integer("total_dil_earned").notNull().default(0),
  medals: integer("medals").notNull().default(0),
  trophies: integer("trophies").notNull().default(0),
  spinTickets: integer("spin_tickets").notNull().default(0),
  vipStatus: boolean("vip_status").notNull().default(false),
  vipExpiryDate: timestamp("vip_expiry_date"),
  // Profile
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  deviceId: text("device_id"), // Anti-cheat
  referralCode: text("referral_code").unique(),
  referredBy: varchar("referred_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
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
  // Room Details
  roomId: text("room_id"),
  roomPassword: text("room_password"),
  // Bonus Rewards
  dilReward: integer("dil_reward").notNull().default(5), // DIL for top 3
  killBonus: decimal("kill_bonus", { precision: 10, scale: 2 }).notNull().default("1"), // Per kill bonus
  minKillsForBonus: integer("min_kills_for_bonus").notNull().default(10),
  medalReward: integer("medal_reward").notNull().default(1), // Medal for winner
  isVipOnly: boolean("is_vip_only").notNull().default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  position: integer("position"),
  kills: integer("kills").default(0),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).default("0"),
  // Result verification
  resultScreenshot: text("result_screenshot"), // Screenshot URL
  isResultVerified: boolean("is_result_verified").notNull().default(false),
  // Bonus rewards earned
  dilEarned: integer("dil_earned").default(0),
  killBonusEarned: decimal("kill_bonus_earned", { precision: 10, scale: 2 }).default("0"),
  medalEarned: integer("medal_earned").default(0),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  // Payment gateway details
  paymentId: text("payment_id"), // Razorpay/UPI transaction ID
  upiId: text("upi_id"), // For withdrawals
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // tournament, system, prize, referral, spin
  isRead: boolean("is_read").notNull().default(false),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// New Advanced Tables

// Spin Wheel System
export const spinWheelRewards = pgTable("spin_wheel_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: rewardTypeEnum("type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(), // Cash amount or quantity
  probability: decimal("probability", { precision: 5, scale: 2 }).notNull(), // 0.01 to 1.00
  dilCost: integer("dil_cost").notNull().default(10), // DILs required to spin
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const spinHistory = pgTable("spin_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardId: varchar("reward_id").notNull().references(() => spinWheelRewards.id),
  rewardType: rewardTypeEnum("reward_type").notNull(),
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }).notNull(),
  dilSpent: integer("dil_spent").notNull(),
  spunAt: timestamp("spun_at").defaultNow(),
});

// Medal System
export const userMedals = pgTable("user_medals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  medalType: medalTypeEnum("medal_type").notNull(),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  reason: text("reason").notNull(), // "1st Place", "10+ Kills", "Headshot King"
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Referral System
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredId: varchar("referred_id").notNull().references(() => users.id),
  referralCode: text("referral_code").notNull(),
  bonusEarned: decimal("bonus_earned", { precision: 10, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// VIP System
export const vipBenefits = pgTable("vip_benefits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  discountPercentage: integer("discount_percentage").default(0), // Entry fee discount
  extraDilMultiplier: decimal("extra_dil_multiplier", { precision: 3, scale: 2 }).default("1.00"),
  prioritySupport: boolean("priority_support").notNull().default(false),
  exclusiveTournaments: boolean("exclusive_tournaments").notNull().default(false),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Daily Bonuses & Achievements
export const dailyBonuses = pgTable("daily_bonuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bonusDate: timestamp("bonus_date").notNull(),
  dilReward: integer("dil_reward").notNull().default(5),
  cashReward: decimal("cash_reward", { precision: 10, scale: 2 }).default("0"),
  claimedAt: timestamp("claimed_at"),
});

// Tournament Templates (for quick creation)
export const tournamentTemplates = pgTable("tournament_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  game: gameEnum("game").notNull(),
  gameMode: gameModeEnum("game_mode").notNull(),
  entryFee: decimal("entry_fee", { precision: 10, scale: 2 }).notNull(),
  maxPlayers: integer("max_players").notNull(),
  prizeDistribution: jsonb("prize_distribution").notNull(), // {1st: 50%, 2nd: 30%, 3rd: 20%}
  dilReward: integer("dil_reward").notNull().default(5),
  killBonus: decimal("kill_bonus", { precision: 10, scale: 2 }).notNull().default("1"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advertisement system
export const advertisements = pgTable("advertisements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  targetUrl: text("target_url"),
  type: text("type").notNull().default("banner"), // "banner", "popup", "native", "video"
  position: text("position").notNull().default("home_top"), // "home_top", "home_bottom", "tournaments", "wallet", "profile"
  isActive: boolean("is_active").notNull().default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalDilEarned: true,
  referralCode: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentPlayers: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  registeredAt: true,
  position: true,
  kills: true,
  earnings: true,
  dilEarned: true,
  killBonusEarned: true,
  medalEarned: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSpinRewardSchema = createInsertSchema(spinWheelRewards).omit({
  id: true,
  createdAt: true,
});

export const insertSpinHistorySchema = createInsertSchema(spinHistory).omit({
  id: true,
  spunAt: true,
});

export const insertUserMedalSchema = createInsertSchema(userMedals).omit({
  id: true,
  earnedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertDailyBonusSchema = createInsertSchema(dailyBonuses).omit({
  id: true,
  claimedAt: true,
});

export const insertTournamentTemplateSchema = createInsertSchema(tournamentTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  impressions: true,
  clicks: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type SpinWheelReward = typeof spinWheelRewards.$inferSelect;
export type InsertSpinReward = z.infer<typeof insertSpinRewardSchema>;

export type SpinHistory = typeof spinHistory.$inferSelect;
export type InsertSpinHistory = z.infer<typeof insertSpinHistorySchema>;

export type UserMedal = typeof userMedals.$inferSelect;
export type InsertUserMedal = z.infer<typeof insertUserMedalSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type VipBenefit = typeof vipBenefits.$inferSelect;

export type DailyBonus = typeof dailyBonuses.$inferSelect;
export type InsertDailyBonus = z.infer<typeof insertDailyBonusSchema>;

export type TournamentTemplate = typeof tournamentTemplates.$inferSelect;
export type InsertTournamentTemplate = z.infer<typeof insertTournamentTemplateSchema>;
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
