import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTournamentSchema, insertRegistrationSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Create tournament
  app.post("/api/tournaments", async (req, res) => {
    try {
      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validatedData);
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tournament data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tournament" });
    }
  });

  // Join tournament
  app.post("/api/tournaments/:id/join", async (req, res) => {
    try {
      const { userId } = req.body;
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

  // Get user registrations
  app.get("/api/users/:userId/registrations", async (req, res) => {
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

  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
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

  // Add money to wallet
  app.post("/api/users/:userId/add-money", async (req, res) => {
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

  // Get user transactions
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Submit tournament result (mock endpoint for demo)
  app.post("/api/tournaments/:id/results", async (req, res) => {
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
