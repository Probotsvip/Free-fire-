import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, Zap } from "lucide-react";
import type { Tournament } from "@shared/schema";

interface TournamentCardProps {
  tournament: Tournament;
  onJoin?: (tournamentId: string) => void;
  onWatch?: (tournamentId: string) => void;
  showActions?: boolean;
}

export default function TournamentCard({ 
  tournament, 
  onJoin, 
  onWatch, 
  showActions = true 
}: TournamentCardProps) {
  const getStatusBadge = () => {
    switch (tournament.status) {
      case "live":
        return <Badge className="bg-gaming-red text-white animate-pulse">LIVE</Badge>;
      case "upcoming":
        return <Badge className="bg-gaming-amber text-gaming-dark">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-gray-600 text-white">Completed</Badge>;
      default:
        return null;
    }
  };

  const getGameImage = () => {
    // Using Unsplash gaming images as placeholders
    return tournament.game === "PUBG" 
      ? "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
      : "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100";
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return "Started";
    return `${hours}h ${minutes}m`;
  };

  const progress = (tournament.currentPlayers / tournament.maxPlayers) * 100;

  return (
    <div className="tournament-card rounded-xl p-4 gaming-card-hover cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={getGameImage()} 
            alt={`${tournament.game} tournament`} 
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-sm text-white">{tournament.title}</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="capitalize">{tournament.gameMode}</span>
              <span>•</span>
              <span>{tournament.map}</span>
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Prize Pool:</span>
          <span className="text-gaming-green font-semibold">₹{tournament.prizePool}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Entry Fee:</span>
          <span className="text-white font-medium">₹{tournament.entryFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Players:</span>
          <span className="text-gaming-cyan">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
        </div>
      </div>

      {tournament.status === "upcoming" && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Starts in</span>
            <span>{formatTime(new Date(tournament.startTime))}</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-gaming-cyan to-gaming-purple h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="text-center">
          <div className="text-gray-400">1st Prize</div>
          <div className="font-semibold text-gaming-green">₹{tournament.firstPrize}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">2nd Prize</div>
          <div className="font-semibold text-gaming-amber">₹{tournament.secondPrize}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">3rd Prize</div>
          <div className="font-semibold text-orange-400">₹{tournament.thirdPrize}</div>
        </div>
      </div>

      {showActions && (
        <div className="space-y-2">
          {tournament.status === "live" ? (
            <Button 
              className="w-full bg-gaming-red hover:bg-red-600 text-white"
              onClick={() => onWatch?.(tournament.id)}
            >
              <Zap className="mr-2 h-4 w-4" />
              Watch Live
            </Button>
          ) : tournament.status === "upcoming" ? (
            <Button 
              className="w-full gaming-gradient hover:from-cyan-400 hover:to-purple-600 text-white"
              onClick={() => onJoin?.(tournament.id)}
              disabled={tournament.currentPlayers >= tournament.maxPlayers}
            >
              <Trophy className="mr-2 h-4 w-4" />
              {tournament.currentPlayers >= tournament.maxPlayers ? "Tournament Full" : "Join Tournament"}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
