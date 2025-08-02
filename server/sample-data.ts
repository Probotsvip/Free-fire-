import { storage } from "./storage";
import bcrypt from "bcrypt";

export async function initializeSampleData() {
  try {
    // Check if data already exists
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log("Sample data already exists, skipping initialization");
      return;
    }

    console.log("Initializing sample data...");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await storage.createUser({
      username: "admin",
      email: "admin@gamewin.com",
      password: adminPassword,
      role: "admin",
    });

    // Create sample users
    const user1Password = await bcrypt.hash("password123", 12);
    const user1 = await storage.createUser({
      username: "ProGamer2023",
      email: "progamer@example.com",
      password: user1Password,
      balance: "2850.00",
      totalEarnings: "45620.00",
      tournamentsWon: 12,
      gamesPlayed: 45,
    });

    const user2Password = await bcrypt.hash("password123", 12);
    const user2 = await storage.createUser({
      username: "FireKing",
      email: "fireking@example.com",
      password: user2Password,
      balance: "1250.00",
      totalEarnings: "22340.00",
      tournamentsWon: 8,
      gamesPlayed: 32,
    });

    const user3Password = await bcrypt.hash("password123", 12);
    const user3 = await storage.createUser({
      username: "BattleQueen",
      email: "battlequeen@example.com",
      password: user3Password,
      balance: "3400.00",
      totalEarnings: "67890.00",
      tournamentsWon: 15,
      gamesPlayed: 38,
    });

    // Create sample tournaments
    const tournament1 = await storage.createTournament({
      title: "PUBG Mobile Clash",
      description: "Epic battle royale tournament with huge prizes",
      game: "PUBG",
      gameMode: "squad",
      map: "Erangel",
      prizePool: "10000.00",
      entryFee: "50.00",
      maxPlayers: 100,
      status: "live",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      firstPrize: "5000.00",
      secondPrize: "3000.00",
      thirdPrize: "2000.00",
      roomId: "PUBG2023",
      roomPassword: "game123",
      createdBy: admin.id,
    });

    const tournament2 = await storage.createTournament({
      title: "PUBG Pro Championship",
      description: "Professional level tournament for serious gamers",
      game: "PUBG",
      gameMode: "squad",
      map: "Sanhok",
      prizePool: "50000.00",
      entryFee: "200.00",
      maxPlayers: 100,
      status: "upcoming",
      startTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000), // 2.5 hours from now
      firstPrize: "25000.00",
      secondPrize: "15000.00",
      thirdPrize: "10000.00",
      roomId: "PUBGPRO2023",
      roomPassword: "pro456",
      createdBy: admin.id,
    });

    const tournament3 = await storage.createTournament({
      title: "Free Fire Battle Royale",
      description: "Fast-paced Free Fire tournament",
      game: "FREE_FIRE",
      gameMode: "solo",
      map: "Bermuda",
      prizePool: "25000.00",
      entryFee: "100.00",
      maxPlayers: 50,
      status: "live",
      startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      firstPrize: "12500.00",
      secondPrize: "7500.00",
      thirdPrize: "5000.00",
      roomId: "FF2023",
      roomPassword: "fire789",
      createdBy: admin.id,
    });

    const tournament4 = await storage.createTournament({
      title: "Weekend Warriors PUBG",
      description: "Casual weekend tournament for all skill levels",
      game: "PUBG",
      gameMode: "duo",
      map: "Miramar",
      prizePool: "5000.00",
      entryFee: "25.00",
      maxPlayers: 80,
      status: "upcoming",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      firstPrize: "2500.00",
      secondPrize: "1500.00",
      thirdPrize: "1000.00",
      roomId: "WEEKEND2023",
      roomPassword: "weekend321",
      createdBy: admin.id,
    });

    // Add some registrations
    await storage.createRegistration({
      userId: user1.id,
      tournamentId: tournament1.id,
    });
    await storage.incrementTournamentPlayers(tournament1.id);

    await storage.createRegistration({
      userId: user2.id,
      tournamentId: tournament1.id,
    });
    await storage.incrementTournamentPlayers(tournament1.id);

    await storage.createRegistration({
      userId: user3.id,
      tournamentId: tournament2.id,
    });
    await storage.incrementTournamentPlayers(tournament2.id);

    // Add some transactions
    await storage.createTransaction({
      userId: user1.id,
      type: "deposit",
      amount: "1000.00",
      description: "Money added to wallet",
    });

    await storage.createTransaction({
      userId: user1.id,
      type: "entry_fee",
      amount: "-50.00",
      description: `Entry fee for ${tournament1.title}`,
      tournamentId: tournament1.id,
    });

    await storage.createTransaction({
      userId: user2.id,
      type: "prize_money",
      amount: "5000.00",
      description: "Prize money for winning PUBG Championship",
    });

    // Add notifications
    await storage.createNotification({
      userId: user1.id,
      title: "Tournament Starting Soon!",
      message: `${tournament1.title} is starting in 30 minutes. Get ready!`,
      type: "tournament",
      tournamentId: tournament1.id,
    });

    await storage.createNotification({
      userId: user2.id,
      title: "Congratulations!",
      message: "You won ₹5000 in the last tournament!",
      type: "prize",
    });

    await storage.createNotification({
      userId: user3.id,
      title: "New Tournament Available",
      message: `${tournament2.title} registration is now open!`,
      type: "tournament",
      tournamentId: tournament2.id,
    });

    console.log("Sample data initialized successfully!");
    console.log("Admin credentials: admin@gamewin.com / admin123");
    console.log("User credentials: progamer@example.com / password123");
    
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}