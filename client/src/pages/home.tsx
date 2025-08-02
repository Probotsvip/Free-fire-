import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TournamentCard from "@/components/tournament-card";
import { Plus, Search, History, Gift, Trophy, Coins, Wallet, Users, User, Zap } from "lucide-react";
import type { Tournament, User as UserType } from "@shared/schema";

export default function Home() {
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<UserType[]>({
    queryKey: ["/api/leaderboard"],
  });

  const liveTournaments = tournaments.filter(t => t.status === "live");
  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming").slice(0, 3);
  const topEarners = leaderboard.slice(0, 3);

  const gameModes = [
    { name: "Squad Battle", description: "4v4 team battles", activeTournaments: 25, icon: Users },
    { name: "Solo Classic", description: "Individual battles", activeTournaments: 18, icon: User },
    { name: "Duo Match", description: "2v2 partner battles", activeTournaments: 12, icon: Users },
    { name: "Quick Match", description: "Fast 5-min games", activeTournaments: 35, icon: Zap },
  ];

  const handleJoinTournament = (tournamentId: string) => {
    // TODO: Implement tournament joining logic
    console.log("Joining tournament:", tournamentId);
  };

  const handleWatchLive = (tournamentId: string) => {
    // TODO: Implement live watch functionality
    console.log("Watching tournament:", tournamentId);
  };

  return (
    <main className="pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="relative px-4 py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="glass-effect rounded-xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gaming-cyan/20 to-gaming-purple/20"></div>
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome Back, <span className="text-gaming-cyan">Gamer</span>! 🎮
              </h1>
              <p className="text-gray-300 mb-4">Join tournaments, win prizes, and climb the leaderboards!</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="text-gaming-amber h-5 w-5" />
                  <span className="text-sm">Tournaments Won: <span className="font-semibold text-gaming-amber">12</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="text-gaming-green h-5 w-5" />
                  <span className="text-sm">Total Earnings: <span className="font-semibold text-gaming-green">₹45,620</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button variant="outline" className="glass-effect h-20 flex-col space-y-2 hover:bg-gaming-cyan/10 border-gray-600">
              <Plus className="h-6 w-6 text-gaming-cyan" />
              <span className="text-sm font-medium">Create Tournament</span>
            </Button>
            <Button variant="outline" className="glass-effect h-20 flex-col space-y-2 hover:bg-gaming-purple/10 border-gray-600">
              <Search className="h-6 w-6 text-gaming-purple" />
              <span className="text-sm font-medium">Find Matches</span>
            </Button>
            <Button variant="outline" className="glass-effect h-20 flex-col space-y-2 hover:bg-gaming-green/10 border-gray-600">
              <History className="h-6 w-6 text-gaming-green" />
              <span className="text-sm font-medium">Match History</span>
            </Button>
            <Button variant="outline" className="glass-effect h-20 flex-col space-y-2 hover:bg-gaming-amber/10 border-gray-600">
              <Gift className="h-6 w-6 text-gaming-amber" />
              <span className="text-sm font-medium">Rewards</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Tournaments */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
              Live Tournaments
            </h2>
            <Button variant="link" className="text-gaming-cyan text-sm font-medium">
              View All
            </Button>
          </div>

          {tournamentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-effect rounded-xl p-4 animate-pulse">
                  <div className="h-20 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : liveTournaments.length === 0 ? (
            <Card className="glass-effect border-gray-600">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Trophy className="h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400 text-center">No live tournaments at the moment</p>
                <p className="text-gray-500 text-sm text-center mt-2">Check back later or create your own tournament!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onWatch={handleWatchLive}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Upcoming Tournaments</h2>
            <Button variant="link" className="text-gaming-cyan text-sm font-medium">
              View All
            </Button>
          </div>

          {tournamentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-effect rounded-xl p-4 animate-pulse">
                  <div className="h-20 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : upcomingTournaments.length === 0 ? (
            <Card className="glass-effect border-gray-600">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Trophy className="h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400 text-center">No upcoming tournaments scheduled</p>
                <p className="text-gray-500 text-sm text-center mt-2">Be the first to create one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onJoin={handleJoinTournament}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Earners */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center">
              <Trophy className="text-gaming-amber mr-3 h-6 w-6" />
              Top Earners This Week
            </h2>
            <Button variant="link" className="text-gaming-cyan text-sm font-medium">
              View Leaderboard
            </Button>
          </div>

          <div className="glass-effect rounded-xl p-6">
            {leaderboardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : topEarners.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No earnings data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topEarners.map((player, index) => (
                  <div key={player.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gaming-navy/50">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-gaming-cyan to-gaming-purple rounded-full flex items-center justify-center text-white font-bold">
                        <span>{player.username.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-gaming-amber text-gaming-dark' :
                        index === 1 ? 'bg-gray-400 text-gaming-dark' :
                        'bg-orange-500 text-white'
                      }`}>
                        <span>{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-white">{player.username}</div>
                      <div className="text-xs text-gray-400">{player.tournamentsWon} games won</div>
                      <div className="text-gaming-green font-semibold text-sm">₹{player.totalEarnings}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Popular Game Modes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gameModes.map((mode, index) => {
              const Icon = mode.icon;
              const gradients = [
                "from-gaming-cyan to-gaming-purple",
                "from-gaming-purple to-gaming-cyan",
                "from-gaming-green to-gaming-cyan",
                "from-gaming-amber to-gaming-green"
              ];
              
              return (
                <div key={mode.name} className="glass-effect rounded-xl p-4 text-center hover:bg-gaming-cyan/10 transition-colors cursor-pointer group">
                  <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-r ${gradients[index]} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="text-2xl text-white h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-1 text-white">{mode.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{mode.description}</p>
                  <div className="text-xs">
                    <span className="text-gray-400">Active: </span>
                    <span className="text-gaming-green font-medium">{mode.activeTournaments} tournaments</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wallet Overview */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Wallet Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-effect rounded-xl p-6 text-center">
              <Wallet className="text-3xl text-gaming-cyan mb-3 h-8 w-8 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Current Balance</h3>
              <div className="text-2xl font-bold text-gaming-green">₹2,850</div>
              <Button className="mt-3 bg-gaming-cyan hover:bg-cyan-400 text-gaming-dark">
                Add Money
              </Button>
            </div>

            <div className="glass-effect rounded-xl p-6 text-center">
              <Trophy className="text-3xl text-gaming-amber mb-3 h-8 w-8 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Total Winnings</h3>
              <div className="text-2xl font-bold text-gaming-amber">₹45,620</div>
              <Button className="mt-3 bg-gaming-amber hover:bg-yellow-400 text-gaming-dark">
                Withdraw
              </Button>
            </div>

            <div className="glass-effect rounded-xl p-6 text-center">
              <Gift className="text-3xl text-gaming-purple mb-3 h-8 w-8 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Bonus Available</h3>
              <div className="text-2xl font-bold text-gaming-purple">₹450</div>
              <Button className="mt-3 bg-gaming-purple hover:bg-purple-600 text-white">
                Use Bonus
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
