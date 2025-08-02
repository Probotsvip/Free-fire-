import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TournamentCard from "@/components/tournament-card";
import { Search, Filter, Trophy } from "lucide-react";
import type { Tournament } from "@shared/schema";

export default function Tournaments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = gameFilter === "all" || tournament.game === gameFilter;
    const matchesMode = modeFilter === "all" || tournament.gameMode === modeFilter;
    
    return matchesSearch && matchesGame && matchesMode;
  });

  const upcomingTournaments = filteredTournaments.filter(t => t.status === "upcoming");
  const liveTournaments = filteredTournaments.filter(t => t.status === "live");
  const completedTournaments = filteredTournaments.filter(t => t.status === "completed");

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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <Trophy className="mr-3 h-8 w-8 text-gaming-amber" />
            Tournaments
          </h1>
          <p className="text-gray-400">Discover and join exciting gaming tournaments</p>
        </div>

        {/* Filters */}
        <div className="glass-effect rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tournaments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gaming-navy border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="w-32 bg-gaming-navy border-gray-600 text-white">
                  <SelectValue placeholder="Game" />
                </SelectTrigger>
                <SelectContent className="bg-gaming-navy border-gray-600">
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="PUBG">PUBG</SelectItem>
                  <SelectItem value="FREE_FIRE">Free Fire</SelectItem>
                </SelectContent>
              </Select>
              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="w-32 bg-gaming-navy border-gray-600 text-white">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent className="bg-gaming-navy border-gray-600">
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="solo">Solo</SelectItem>
                  <SelectItem value="duo">Duo</SelectItem>
                  <SelectItem value="squad">Squad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tournament Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gaming-navy border border-gray-600">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-gaming-cyan data-[state=active]:text-gaming-dark"
            >
              Upcoming ({upcomingTournaments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="live" 
              className="data-[state=active]:bg-gaming-red data-[state=active]:text-white"
            >
              Live ({liveTournaments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="data-[state=active]:bg-gray-600 data-[state=active]:text-white"
            >
              Completed ({completedTournaments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-effect rounded-xl p-4 animate-pulse">
                    <div className="h-20 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : upcomingTournaments.length === 0 ? (
              <Card className="glass-effect border-gray-600">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Tournaments</h3>
                  <p className="text-gray-400 text-center">
                    {searchQuery || gameFilter !== "all" || modeFilter !== "all" 
                      ? "No tournaments match your current filters" 
                      : "No upcoming tournaments scheduled at the moment"}
                  </p>
                  <Button className="mt-4 gaming-gradient">
                    Create Tournament
                  </Button>
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
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-effect rounded-xl p-4 animate-pulse">
                    <div className="h-20 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : liveTournaments.length === 0 ? (
              <Card className="glass-effect border-gray-600">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gaming-red rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Live Tournaments</h3>
                  <p className="text-gray-400 text-center">
                    No tournaments are currently running. Check back soon!
                  </p>
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
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-effect rounded-xl p-4 animate-pulse">
                    <div className="h-20 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : completedTournaments.length === 0 ? (
              <Card className="glass-effect border-gray-600">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Completed Tournaments</h3>
                  <p className="text-gray-400 text-center">
                    No tournaments have been completed yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
