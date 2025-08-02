import { 
  users,
  tournaments,
  registrations,
  transactions,
  notifications,
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
  type InsertNotification
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

  // Admin
  getAllUsers(): Promise<User[]>;
  getUsersCount(): Promise<number>;
  getTournamentsCount(): Promise<number>;
  getActiveUsersCount(): Promise<number>;
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
}

export const storage = new DatabaseStorage();