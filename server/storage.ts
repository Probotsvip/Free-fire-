import { 
  type User, 
  type InsertUser, 
  type Tournament, 
  type InsertTournament,
  type Registration,
  type InsertRegistration,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: string): Promise<User>;
  updateUserStats(userId: string, stats: { tournamentsWon?: number; totalEarnings?: string; gamesPlayed?: number }): Promise<User>;

  // Tournaments
  getTournament(id: string): Promise<Tournament | undefined>;
  getAllTournaments(): Promise<Tournament[]>;
  getTournamentsByStatus(status: string): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament>;
  incrementTournamentPlayers(id: string): Promise<Tournament>;

  // Registrations
  getRegistration(userId: string, tournamentId: string): Promise<Registration | undefined>;
  getTournamentRegistrations(tournamentId: string): Promise<Registration[]>;
  getUserRegistrations(userId: string): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistrationResult(id: string, result: { position: number; kills: number; earnings: string }): Promise<Registration>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;

  // Leaderboard
  getTopEarners(limit?: number): Promise<(User & { weeklyEarnings?: string })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tournaments: Map<string, Tournament>;
  private registrations: Map<string, Registration>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.registrations = new Map();
    this.transactions = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: "user-1",
      username: "ProGamer2023",
      email: "progamer@example.com",
      password: "hashed_password",
      balance: "2850.00",
      totalEarnings: "45620.00",
      tournamentsWon: 12,
      gamesPlayed: 45,
      avatar: null,
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample tournaments
    const tournaments: Tournament[] = [
      {
        id: "tournament-1",
        title: "PUBG Mobile Clash",
        game: "PUBG",
        gameMode: "squad",
        map: "Erangel",
        prizePool: "10000.00",
        entryFee: "50.00",
        maxPlayers: 100,
        currentPlayers: 85,
        status: "live",
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: null,
        firstPrize: "5000.00",
        secondPrize: "3000.00",
        thirdPrize: "2000.00",
        createdAt: new Date(),
      },
      {
        id: "tournament-2",
        title: "PUBG Pro Championship",
        game: "PUBG",
        gameMode: "squad",
        map: "Sanhok",
        prizePool: "50000.00",
        entryFee: "200.00",
        maxPlayers: 100,
        currentPlayers: 85,
        status: "upcoming",
        startTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000), // 2.5 hours from now
        endTime: null,
        firstPrize: "25000.00",
        secondPrize: "15000.00",
        thirdPrize: "10000.00",
        createdAt: new Date(),
      },
      {
        id: "tournament-3",
        title: "Free Fire Battle Royale",
        game: "FREE_FIRE",
        gameMode: "solo",
        map: "Bermuda",
        prizePool: "25000.00",
        entryFee: "100.00",
        maxPlayers: 50,
        currentPlayers: 45,
        status: "live",
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        endTime: null,
        firstPrize: "12500.00",
        secondPrize: "7500.00",
        thirdPrize: "5000.00",
        createdAt: new Date(),
      },
    ];

    tournaments.forEach(tournament => {
      this.tournaments.set(tournament.id, tournament);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      balance: "0.00",
      totalEarnings: "0.00",
      tournamentsWon: 0,
      gamesPlayed: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: string, amount: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, balance: amount };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStats(userId: string, stats: { tournamentsWon?: number; totalEarnings?: string; gamesPlayed?: number }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...stats };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Tournaments
  async getTournament(id: string): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTournamentsByStatus(status: string): Promise<Tournament[]> {
    return Array.from(this.tournaments.values())
      .filter(tournament => tournament.status === status)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = randomUUID();
    const tournament: Tournament = {
      ...insertTournament,
      id,
      currentPlayers: 0,
      createdAt: new Date(),
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const tournament = this.tournaments.get(id);
    if (!tournament) throw new Error("Tournament not found");
    
    const updatedTournament = { ...tournament, ...updates };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  async incrementTournamentPlayers(id: string): Promise<Tournament> {
    const tournament = this.tournaments.get(id);
    if (!tournament) throw new Error("Tournament not found");
    
    const updatedTournament = { ...tournament, currentPlayers: tournament.currentPlayers + 1 };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  // Registrations
  async getRegistration(userId: string, tournamentId: string): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      reg => reg.userId === userId && reg.tournamentId === tournamentId
    );
  }

  async getTournamentRegistrations(tournamentId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(reg => reg.tournamentId === tournamentId);
  }

  async getUserRegistrations(userId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(reg => reg.userId === userId);
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const registration: Registration = {
      ...insertRegistration,
      id,
      position: null,
      kills: 0,
      earnings: "0.00",
      registeredAt: new Date(),
    };
    this.registrations.set(id, registration);
    return registration;
  }

  async updateRegistrationResult(id: string, result: { position: number; kills: number; earnings: string }): Promise<Registration> {
    const registration = this.registrations.get(id);
    if (!registration) throw new Error("Registration not found");
    
    const updatedRegistration = { ...registration, ...result };
    this.registrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  // Transactions
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  // Leaderboard
  async getTopEarners(limit: number = 10): Promise<(User & { weeklyEarnings?: string })[]> {
    const users = Array.from(this.users.values())
      .sort((a, b) => parseFloat(b.totalEarnings) - parseFloat(a.totalEarnings))
      .slice(0, limit);
    
    // Add mock weekly earnings for demo
    return users.map(user => ({
      ...user,
      weeklyEarnings: (parseFloat(user.totalEarnings) * 0.1).toFixed(2),
    }));
  }
}

export const storage = new MemStorage();
