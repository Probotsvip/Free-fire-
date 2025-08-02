import { 
  users,
  tournaments,
  registrations,
  transactions,
  notifications,
  spinWheelRewards,
  spinHistory,
  userMedals,
  referrals,
  dailyBonuses,
  tournamentTemplates,
  type User, 
  type InsertUser, 
  type UpsertUser,
  type Tournament, 
  type InsertTournament,
  type Registration,
  type InsertRegistration,
  type Transaction,
  type InsertTransaction,
  type Notification,
  type InsertNotification,
  type SpinWheelReward,
  type InsertSpinReward,
  type SpinHistory,
  type InsertSpinHistory,
  type UserMedal,
  type InsertUserMedal,
  type Referral,
  type InsertReferral,
  type DailyBonus,
  type InsertDailyBonus,
  type TournamentTemplate,
  type InsertTournamentTemplate,
  advertisements,
  type Advertisement,
  type InsertAdvertisement
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: string): Promise<User>;
  updateUserStats(userId: string, stats: { tournamentsWon?: number; totalEarnings?: string; gamesPlayed?: number }): Promise<User>;
  updateUserLastLogin(userId: string): Promise<User>;

  // Tournaments
  getTournament(id: string): Promise<Tournament | undefined>;
  getAllTournaments(): Promise<Tournament[]>;
  getTournamentsByStatus(status: string): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament>;
  incrementTournamentPlayers(id: string): Promise<Tournament>;
  getTournamentsByCreator(createdBy: string): Promise<Tournament[]>;

  // Registrations
  getRegistration(userId: string, tournamentId: string): Promise<Registration | undefined>;
  getTournamentRegistrations(tournamentId: string): Promise<Registration[]>;
  getUserRegistrations(userId: string): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistrationResult(id: string, result: { position: number; kills: number; earnings: string }): Promise<Registration>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Leaderboard
  getTopEarners(limit?: number): Promise<(User & { weeklyEarnings?: string })[]>;

  // DIL & Rewards System
  updateUserDilBalance(userId: string, dilAmount: number): Promise<User>;
  updateUserMedals(userId: string, medalCount: number): Promise<User>;
  addUserMedal(medal: InsertUserMedal): Promise<UserMedal>;
  getUserMedals(userId: string): Promise<UserMedal[]>;

  // Spin Wheel System
  getSpinWheelRewards(): Promise<SpinWheelReward[]>;
  createSpinReward(reward: InsertSpinReward): Promise<SpinWheelReward>;
  spinWheel(userId: string, dilCost: number): Promise<{ reward: SpinWheelReward; spinRecord: SpinHistory }>;
  getUserSpinHistory(userId: string): Promise<SpinHistory[]>;

  // Referral System
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByReferrer(referrerId: string): Promise<Referral[]>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;

  // Daily Bonus System
  claimDailyBonus(userId: string): Promise<DailyBonus>;
  getUserDailyBonuses(userId: string): Promise<DailyBonus[]>;
  checkDailyBonusAvailable(userId: string): Promise<boolean>;

  // Tournament Templates
  getTournamentTemplates(): Promise<TournamentTemplate[]>;
  createTournamentTemplate(template: InsertTournamentTemplate): Promise<TournamentTemplate>;

  // Enhanced Tournament Features
  updateRegistrationWithRewards(registrationId: string, data: {
    position?: number;
    kills?: number;
    earnings?: string;
    dilEarned?: number;
    killBonusEarned?: string;
    medalEarned?: number;
    resultScreenshot?: string;
  }): Promise<Registration>;

  // Admin
  getAllUsers(): Promise<User[]>;
  getUsersCount(): Promise<number>;
  getTournamentsCount(): Promise<number>;
  getActiveUsersCount(): Promise<number>;

  // Advertisements
  getAllAdvertisements(): Promise<Advertisement[]>;
  createAdvertisement(advertisement: InsertAdvertisement): Promise<Advertisement>;
  getAdvertisementById(id: string): Promise<Advertisement | null>;
  updateAdvertisement(id: string, updates: Partial<InsertAdvertisement>): Promise<Advertisement>;
  deleteAdvertisement(id: string): Promise<void>;
  getActiveAdvertisementsByPosition(position: string): Promise<Advertisement[]>;
  incrementAdImpressions(id: string): Promise<void>;
  incrementAdClicks(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
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

  async updateUserBalance(userId: string, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ balance: amount, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserStats(userId: string, stats: { tournamentsWon?: number; totalEarnings?: string; gamesPlayed?: number }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserLastLogin(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  // Tournaments
  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
  }

  async getTournamentsByStatus(status: string): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.status, status as any))
      .orderBy(tournaments.startTime);
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const [tournament] = await db
      .insert(tournaments)
      .values(insertTournament)
      .returning();
    return tournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const [tournament] = await db
      .update(tournaments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tournaments.id, id))
      .returning();
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  async incrementTournamentPlayers(id: string): Promise<Tournament> {
    const [tournament] = await db
      .update(tournaments)
      .set({ 
        currentPlayers: sql`${tournaments.currentPlayers} + 1`,
        updatedAt: new Date()
      })
      .where(eq(tournaments.id, id))
      .returning();
    if (!tournament) throw new Error("Tournament not found");
    return tournament;
  }

  async getTournamentsByCreator(createdBy: string): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.createdBy, createdBy))
      .orderBy(desc(tournaments.createdAt));
  }

  // Registrations
  async getRegistration(userId: string, tournamentId: string): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(and(eq(registrations.userId, userId), eq(registrations.tournamentId, tournamentId)));
    return registration;
  }

  async getTournamentRegistrations(tournamentId: string): Promise<Registration[]> {
    return await db
      .select()
      .from(registrations)
      .where(eq(registrations.tournamentId, tournamentId));
  }

  async getUserRegistrations(userId: string): Promise<Registration[]> {
    return await db
      .select()
      .from(registrations)
      .where(eq(registrations.userId, userId))
      .orderBy(desc(registrations.registeredAt));
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const [registration] = await db
      .insert(registrations)
      .values(insertRegistration)
      .returning();
    return registration;
  }

  async updateRegistrationResult(id: string, result: { position: number; kills: number; earnings: string }): Promise<Registration> {
    const [registration] = await db
      .update(registrations)
      .set(result)
      .where(eq(registrations.id, id))
      .returning();
    if (!registration) throw new Error("Registration not found");
    return registration;
  }

  async updateRegistrationWithRewards(registrationId: string, data: {
    position?: number;
    kills?: number;
    earnings?: string;
    dilEarned?: number;
    killBonusEarned?: string;
    medalEarned?: number;
    resultScreenshot?: string;
  }): Promise<Registration> {
    const [registration] = await db
      .update(registrations)
      .set({
        ...data,
        isResultVerified: true
      })
      .where(eq(registrations.id, registrationId))
      .returning();
    if (!registration) throw new Error("Registration not found");
    return registration;
  }

  // Transactions
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    if (!notification) throw new Error("Notification not found");
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  // Leaderboard
  async getTopEarners(limit: number = 10): Promise<(User & { weeklyEarnings?: string })[]> {
    const topUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.totalEarnings))
      .limit(limit);
    
    // Add mock weekly earnings for demo (in real app, calculate from transactions)
    return topUsers.map(user => ({
      ...user,
      weeklyEarnings: (parseFloat(user.totalEarnings) * 0.1).toFixed(2),
    }));
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result.count;
  }

  async getTournamentsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(tournaments);
    return result.count;
  }

  async getActiveUsersCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));
    return result.count;
  }

  // DIL & Rewards System Implementation
  async updateUserDilBalance(userId: string, dilAmount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        dilBalance: sql`${users.dilBalance} + ${dilAmount}`,
        totalDilEarned: sql`${users.totalDilEarned} + ${dilAmount > 0 ? dilAmount : 0}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserMedals(userId: string, medalCount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        medals: sql`${users.medals} + ${medalCount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async addUserMedal(insertMedal: InsertUserMedal): Promise<UserMedal> {
    const [medal] = await db
      .insert(userMedals)
      .values(insertMedal)
      .returning();
    return medal;
  }

  async getUserMedals(userId: string): Promise<UserMedal[]> {
    return await db
      .select()
      .from(userMedals)
      .where(eq(userMedals.userId, userId))
      .orderBy(desc(userMedals.earnedAt));
  }

  // Spin Wheel System Implementation
  async getSpinWheelRewards(): Promise<SpinWheelReward[]> {
    return await db
      .select()
      .from(spinWheelRewards)
      .where(eq(spinWheelRewards.isActive, true))
      .orderBy(spinWheelRewards.probability);
  }

  async createSpinReward(insertReward: InsertSpinReward): Promise<SpinWheelReward> {
    const [reward] = await db
      .insert(spinWheelRewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async spinWheel(userId: string, dilCost: number): Promise<{ reward: SpinWheelReward; spinRecord: SpinHistory }> {
    // Get available rewards
    const rewards = await this.getSpinWheelRewards();
    if (rewards.length === 0) throw new Error("No rewards available");

    // Calculate weighted random selection
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedReward = rewards[0];

    for (const reward of rewards) {
      cumulativeProbability += parseFloat(reward.probability);
      if (random <= cumulativeProbability) {
        selectedReward = reward;
        break;
      }
    }

    // Deduct DIL from user
    await this.updateUserDilBalance(userId, -dilCost);

    // Create spin history record
    const [spinRecord] = await db
      .insert(spinHistory)
      .values({
        userId,
        rewardId: selectedReward.id,
        rewardType: selectedReward.type,
        rewardValue: selectedReward.value,
        dilSpent: dilCost
      })
      .returning();

    // Award the reward to user
    if (selectedReward.type === "cash") {
      const newBalance = sql`${users.balance} + ${selectedReward.value}`;
      await db.update(users).set({ balance: newBalance }).where(eq(users.id, userId));
      
      // Create transaction record
      await this.createTransaction({
        userId,
        type: "spin_reward",
        amount: selectedReward.value,
        description: `Spin wheel reward: ₹${selectedReward.value}`
      });
    } else if (selectedReward.type === "dil") {
      await this.updateUserDilBalance(userId, parseInt(selectedReward.value));
    }

    return { reward: selectedReward, spinRecord };
  }

  async getUserSpinHistory(userId: string): Promise<SpinHistory[]> {
    return await db
      .select()
      .from(spinHistory)
      .where(eq(spinHistory.userId, userId))
      .orderBy(desc(spinHistory.spunAt))
      .limit(50);
  }

  // Referral System Implementation
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values(insertReferral)
      .returning();
    return referral;
  }

  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId))
      .orderBy(desc(referrals.createdAt));
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user;
  }

  // Daily Bonus System Implementation
  async claimDailyBonus(userId: string): Promise<DailyBonus> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [bonus] = await db
      .insert(dailyBonuses)
      .values({
        userId,
        bonusDate: today,
        dilReward: 5,
        cashReward: "10.00",
        claimedAt: new Date()
      })
      .returning();

    // Add DIL and cash to user
    await this.updateUserDilBalance(userId, 5);
    const newBalance = sql`${users.balance} + 10.00`;
    await db.update(users).set({ balance: newBalance }).where(eq(users.id, userId));

    // Create transaction
    await this.createTransaction({
      userId,
      type: "bonus",
      amount: "10.00",
      description: "Daily login bonus"
    });

    return bonus;
  }

  async getUserDailyBonuses(userId: string): Promise<DailyBonus[]> {
    return await db
      .select()
      .from(dailyBonuses)
      .where(eq(dailyBonuses.userId, userId))
      .orderBy(desc(dailyBonuses.bonusDate))
      .limit(30);
  }

  async checkDailyBonusAvailable(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [existing] = await db
      .select()
      .from(dailyBonuses)
      .where(and(
        eq(dailyBonuses.userId, userId),
        eq(dailyBonuses.bonusDate, today)
      ));

    return !existing;
  }

  // Tournament Templates Implementation
  async getTournamentTemplates(): Promise<TournamentTemplate[]> {
    return await db
      .select()
      .from(tournamentTemplates)
      .where(eq(tournamentTemplates.isActive, true))
      .orderBy(tournamentTemplates.entryFee);
  }

  async createTournamentTemplate(insertTemplate: InsertTournamentTemplate): Promise<TournamentTemplate> {
    const [template] = await db
      .insert(tournamentTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  // Advertisement methods
  async getAllAdvertisements(): Promise<Advertisement[]> {
    return db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
  }

  async createAdvertisement(advertisement: InsertAdvertisement): Promise<Advertisement> {
    const [result] = await db.insert(advertisements).values(advertisement).returning();
    return result;
  }

  async getAdvertisementById(id: string): Promise<Advertisement | null> {
    const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, id));
    return ad || null;
  }

  async updateAdvertisement(id: string, updates: Partial<InsertAdvertisement>): Promise<Advertisement> {
    const [result] = await db.update(advertisements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(advertisements.id, id))
      .returning();
    return result;
  }

  async deleteAdvertisement(id: string): Promise<void> {
    await db.delete(advertisements).where(eq(advertisements.id, id));
  }

  async getActiveAdvertisementsByPosition(position: string): Promise<Advertisement[]> {
    return db.select().from(advertisements)
      .where(and(
        eq(advertisements.isActive, true),
        eq(advertisements.position, position)
      ))
      .orderBy(desc(advertisements.createdAt));
  }

  async incrementAdImpressions(id: string): Promise<void> {
    await db.update(advertisements)
      .set({ impressions: sql`${advertisements.impressions} + 1` })
      .where(eq(advertisements.id, id));
  }

  async incrementAdClicks(id: string): Promise<void> {
    await db.update(advertisements)
      .set({ clicks: sql`${advertisements.clicks} + 1` })
      .where(eq(advertisements.id, id));
  }
}

export const storage = new DatabaseStorage();