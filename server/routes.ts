import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import session from "express-session";
import { storage } from "./storage";
import { insertTournamentSchema, insertRegistrationSchema, insertTransactionSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import connectPg from "connect-pg-simple";

// Session configuration
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  ttl: sessionTtl,
  tableName: "sessions",
});

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key-here",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: sessionTtl,
  },
};

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: any;
}

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    req.user = { id: (req.session as any).userId };
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.user.id);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(express.json());
  app.use(session(sessionConfig));
  
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });
      
      // Create session
      (req.session as any).userId = user.id;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Update last login
      await storage.updateUserLastLogin(user.id);
      
      // Create session
      (req.session as any).userId = user.id;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/user", async (req: AuthenticatedRequest, res) => {
    try {
      if (!(req.session as any)?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.post("/api/users/:userId/update-last-login", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.params.userId;
      
      if (req.user?.id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const user = await storage.updateUserLastLogin(userId);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update last login error:", error);
      res.status(500).json({ message: "Failed to update last login" });
    }
  });
  // Get all tournaments
  app.get("/api/tournaments", async (req, res) => {
    try {
      const { status } = req.query;
      let tournaments;
      
      if (status && typeof status === "string") {
        tournaments = await storage.getTournamentsByStatus(status);
      } else {
        tournaments = await storage.getAllTournaments();
      }
      
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  // Get tournament by ID
  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });

  // Create tournament (admin only)
  app.post("/api/tournaments", isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertTournamentSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      const tournament = await storage.createTournament(validatedData);
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tournament data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tournament" });
    }
  });

  // Join tournament (requires authentication)
  app.post("/api/tournaments/:id/join", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const tournamentId = req.params.id;

      // Check if tournament exists
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      // Check if user is already registered
      const existingRegistration = await storage.getRegistration(userId, tournamentId);
      if (existingRegistration) {
        return res.status(400).json({ message: "Already registered for this tournament" });
      }

      // Check if tournament is full
      if (tournament.currentPlayers >= tournament.maxPlayers) {
        return res.status(400).json({ message: "Tournament is full" });
      }

      // Check user balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (parseFloat(user.balance) < parseFloat(tournament.entryFee)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create registration
      const registration = await storage.createRegistration({ userId, tournamentId });

      // Deduct entry fee from user balance
      const newBalance = (parseFloat(user.balance) - parseFloat(tournament.entryFee)).toFixed(2);
      await storage.updateUserBalance(userId, newBalance);

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: "entry_fee",
        amount: `-${tournament.entryFee}`,
        description: `Entry fee for ${tournament.title}`,
        tournamentId,
      });

      // Increment tournament player count
      await storage.incrementTournamentPlayers(tournamentId);

      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to join tournament" });
    }
  });

  // Get user registrations (requires authentication)
  app.get("/api/users/:userId/registrations", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const registrations = await storage.getUserRegistrations(req.params.userId);
      
      // Populate with tournament data
      const populatedRegistrations = await Promise.all(
        registrations.map(async (reg) => {
          const tournament = await storage.getTournament(reg.tournamentId);
          return { ...reg, tournament };
        })
      );
      
      res.json(populatedRegistrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user registrations" });
    }
  });

  // Get user profile (requires authentication for own profile)
  app.get("/api/users/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const topEarners = await storage.getTopEarners(parseInt(limit as string));
      res.json(topEarners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Add money to wallet (requires authentication)
  app.post("/api/users/:userId/add-money", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { amount } = req.body;
      const userId = req.params.userId;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = (parseFloat(user.balance) + parseFloat(amount)).toFixed(2);
      const updatedUser = await storage.updateUserBalance(userId, newBalance);

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: "deposit",
        amount: amount,
        description: "Money added to wallet",
      });

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to add money" });
    }
  });

  // Get user transactions (requires authentication)
  app.get("/api/users/:userId/transactions", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Submit tournament result (admin only)
  app.post("/api/tournaments/:id/results", isAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, position, kills } = req.body;
      const tournamentId = req.params.id;

      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      const registration = await storage.getRegistration(userId, tournamentId);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      // Calculate earnings based on position
      let earnings = "0.00";
      if (position === 1) earnings = tournament.firstPrize;
      else if (position === 2) earnings = tournament.secondPrize;
      else if (position === 3) earnings = tournament.thirdPrize;

      // Update registration with results
      await storage.updateRegistrationResult(registration.id, {
        position,
        kills,
        earnings,
      });

      // If user won prize money, update their balance
      if (parseFloat(earnings) > 0) {
        const user = await storage.getUser(userId);
        if (user) {
          const newBalance = (parseFloat(user.balance) + parseFloat(earnings)).toFixed(2);
          const newTotalEarnings = (parseFloat(user.totalEarnings) + parseFloat(earnings)).toFixed(2);
          const newTournamentsWon = position <= 3 ? user.tournamentsWon + 1 : user.tournamentsWon;

          await storage.updateUserBalance(userId, newBalance);
          await storage.updateUserStats(userId, {
            totalEarnings: newTotalEarnings,
            tournamentsWon: newTournamentsWon,
            gamesPlayed: user.gamesPlayed + 1,
          });

          // Create transaction record
          await storage.createTransaction({
            userId,
            type: "prize_money",
            amount: earnings,
            description: `Prize money for ${tournament.title} (Position: ${position})`,
            tournamentId,
          });
        }
      }

      res.json({ message: "Results submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
