import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, TrendingUp, GamepadIcon } from "lucide-react";
import type { User } from "@shared/schema";

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-gaming-amber" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-400" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gaming-amber text-gaming-dark";
    if (rank === 2) return "bg-gray-400 text-gaming-dark";
    if (rank === 3) return "bg-orange-400 text-white";
    return "bg-gray-600 text-white";
  };

  return (
    <main className="pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <Crown className="mr-3 h-8 w-8 text-gaming-amber" />
            Leaderboard
          </h1>
          <p className="text-gray-400">Top earners in the GameWin community</p>
        </div>

        {/* Top 3 Podium */}
        {!isLoading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="md:order-1 order-2">
              <Card className="glass-effect border-gray-600 text-center relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gray-400 text-gaming-dark font-bold">#2</Badge>
                </div>
                <CardContent className="pt-8 pb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {leaderboard[1].username.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{leaderboard[1].username}</h3>
                  <p className="text-gaming-green font-bold text-lg">₹{leaderboard[1].totalEarnings}</p>
                  <p className="text-xs text-gray-400">{leaderboard[1].tournamentsWon} tournaments won</p>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="md:order-2 order-1 md:-mt-4">
              <Card className="glass-effect border-gaming-amber text-center relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-gaming-amber rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-gaming-dark" />
                  </div>
                </div>
                <CardContent className="pt-8 pb-4">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-r from-gaming-amber to-yellow-500 rounded-full flex items-center justify-center text-gaming-dark font-bold text-xl animate-glow">
                    {leaderboard[0].username.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-white mb-1 text-lg">{leaderboard[0].username}</h3>
                  <p className="text-gaming-green font-bold text-xl">₹{leaderboard[0].totalEarnings}</p>
                  <p className="text-xs text-gray-400">{leaderboard[0].tournamentsWon} tournaments won</p>
                  <Badge className="mt-2 bg-gaming-amber text-gaming-dark">Champion</Badge>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="md:order-3 order-3">
              <Card className="glass-effect border-gray-600 text-center relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-400 text-white font-bold">#3</Badge>
                </div>
                <CardContent className="pt-8 pb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {leaderboard[2].username.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{leaderboard[2].username}</h3>
                  <p className="text-gaming-green font-bold text-lg">₹{leaderboard[2].totalEarnings}</p>
                  <p className="text-xs text-gray-400">{leaderboard[2].tournamentsWon} tournaments won</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="glass-effect border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <TrendingUp className="mr-2 h-5 w-5 text-gaming-cyan" />
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-8 h-8 bg-gray-700 rounded"></div>
                    <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <GamepadIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
                <p className="text-gray-400">Leaderboard data is not available at the moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {leaderboard.map((player, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center space-x-4 p-4 hover:bg-gaming-navy/30 transition-colors ${
                        rank <= 3 ? "bg-gaming-navy/20" : ""
                      }`}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankIcon(rank)}
                      </div>
                      
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          rank === 1 ? "bg-gradient-to-r from-gaming-amber to-yellow-500" :
                          rank === 2 ? "bg-gradient-to-r from-gray-400 to-gray-500" :
                          rank === 3 ? "bg-gradient-to-r from-orange-400 to-orange-500" :
                          "bg-gradient-to-r from-gaming-cyan to-gaming-purple"
                        }`}>
                          {player.username.substring(0, 2).toUpperCase()}
                        </div>
                        {rank <= 3 && (
                          <Badge className={`absolute -bottom-1 -right-1 text-xs ${getRankBadge(rank)}`}>
                            #{rank}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">{player.username}</h3>
                          {rank <= 3 && (
                            <Badge variant="outline" className="text-xs border-gaming-cyan text-gaming-cyan">
                              Top {rank}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{player.tournamentsWon} wins</span>
                          <span>•</span>
                          <span>{player.gamesPlayed} games</span>
                          <span>•</span>
                          <span>
                            {player.gamesPlayed > 0 
                              ? Math.round((player.tournamentsWon / player.gamesPlayed) * 100) 
                              : 0}% win rate
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-gaming-green font-bold text-lg">
                          ₹{player.totalEarnings}
                        </div>
                        <div className="text-xs text-gray-400">Total Earnings</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
