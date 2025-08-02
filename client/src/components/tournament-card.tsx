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
        return <Badge className="status-live text-white font-bold px-3 py-1 animate-pulse-glow">● LIVE</Badge>;
      case "upcoming":
        return <Badge className="status-upcoming text-primary font-bold px-3 py-1">⏰ Upcoming</Badge>;
      case "completed":
        return <Badge className="status-completed text-white font-medium px-3 py-1">✓ Completed</Badge>;
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
    <div className="tournament-card mobile-card card-hover-effect mobile-optimized cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={getGameImage()} 
              alt={`${tournament.game} tournament`} 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue rounded-full border-2 border-primary flex items-center justify-center">
              <span className="text-xs font-bold text-white">{tournament.game === 'PUBG' ? 'P' : 'F'}</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-white leading-tight mb-1">{tournament.title}</h3>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="capitalize font-medium">{tournament.gameMode}</span>
              <span>•</span>
              <span className="font-medium">{tournament.map}</span>
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="premium-glass p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-xs font-medium">Prize Pool</span>
            <span className="text-success font-bold text-lg">₹{tournament.prizePool}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-xs font-medium">Entry Fee</span>
            <span className="text-warning font-semibold">₹{tournament.entryFee}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-xs font-medium">Players</span>
            <span className="text-cyan font-semibold">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
          </div>
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
        <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'var(--gradient-primary)'
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 glass-effect rounded-lg">
          <div className="text-muted-foreground text-xs mb-1">1st</div>
          <div className="font-bold text-warning text-sm">₹{tournament.firstPrize}</div>
        </div>
        <div className="text-center p-2 glass-effect rounded-lg">
          <div className="text-muted-foreground text-xs mb-1">2nd</div>
          <div className="font-bold text-cyan text-sm">₹{tournament.secondPrize}</div>
        </div>
        <div className="text-center p-2 glass-effect rounded-lg">
          <div className="text-muted-foreground text-xs mb-1">3rd</div>
          <div className="font-bold text-orange text-sm">₹{tournament.thirdPrize}</div>
        </div>
      </div>

      {showActions && (
        <div className="space-y-3">
          {tournament.status === "live" ? (
            <Button 
              className="w-full gaming-button mobile-optimized bg-danger hover:bg-danger/90"
              onClick={() => onWatch?.(tournament.id)}
            >
              <Zap className="mr-2 h-4 w-4" />
              <span className="font-bold">Watch Live</span>
            </Button>
          ) : tournament.status === "upcoming" ? (
            <Button 
              className={`w-full mobile-optimized font-bold ${
                tournament.currentPlayers >= tournament.maxPlayers 
                  ? "bg-secondary text-muted-foreground cursor-not-allowed" 
                  : "gaming-button"
              }`}
              onClick={() => onJoin?.(tournament.id)}
              disabled={tournament.currentPlayers >= tournament.maxPlayers}
            >
              <Trophy className="mr-2 h-5 w-5" />
              <span>{tournament.currentPlayers >= tournament.maxPlayers ? "Tournament Full" : "Join Now"}</span>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
