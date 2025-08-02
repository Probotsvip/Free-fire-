import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Trophy, 
  Target, 
  GamepadIcon, 
  Calendar, 
  TrendingUp,
  Settings,
  LogOut,
  Edit
} from "lucide-react";
import type { User as UserType, Registration, Tournament } from "@shared/schema";

export default function Profile() {
  // Mock user ID - in a real app, this would come from authentication
  const userId = "user-1";

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/users", userId],
  });

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<(Registration & { tournament?: Tournament })[]>({
    queryKey: ["/api/users", userId, "registrations"],
  });

  const recentMatches = registrations.slice(0, 5);
  const wonMatches = registrations.filter(r => r.position && r.position <= 3);
  const totalEarnings = registrations.reduce((sum, r) => sum + parseFloat(r.earnings || "0"), 0);

  const stats = [
    {
      label: "Total Earnings",
      value: `₹${user?.totalEarnings || "0"}`,
      icon: Trophy,
      color: "text-gaming-green",
    },
    {
      label: "Tournaments Won",
      value: user?.tournamentsWon || 0,
      icon: Target,
      color: "text-gaming-amber",
    },
    {
      label: "Games Played",
      value: user?.gamesPlayed || 0,
      icon: GamepadIcon,
      color: "text-gaming-cyan",
    },
    {
      label: "Win Rate",
      value: user?.gamesPlayed ? `${Math.round((user.tournamentsWon / user.gamesPlayed) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-gaming-purple",
    },
  ];

  const getPositionBadge = (position: number | null) => {
    if (!position) return null;
    
    if (position === 1) return <Badge className="bg-gaming-amber text-gaming-dark">1st</Badge>;
    if (position === 2) return <Badge className="bg-gray-400 text-gaming-dark">2nd</Badge>;
    if (position === 3) return <Badge className="bg-orange-400 text-white">3rd</Badge>;
    return <Badge variant="outline" className="border-gray-600 text-gray-400">#{position}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (userLoading) {
    return (
      <main className="pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-700 rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="glass-effect rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-gaming-cyan to-gaming-purple rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user?.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <Badge className="bg-gaming-green text-white">Active</Badge>
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{user?.username}</h1>
              <p className="text-gray-400 mb-4">Professional Gamer • Member since {formatDate(user?.createdAt!)}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-gaming-cyan text-gaming-cyan">PUBG Pro</Badge>
                <Badge variant="outline" className="border-gaming-purple text-gaming-purple">Free Fire Expert</Badge>
                {user && user.tournamentsWon > 10 && (
                  <Badge variant="outline" className="border-gaming-amber text-gaming-amber">Tournament Master</Badge>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gaming-navy">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gaming-navy">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="glass-effect border-gray-600">
                <CardContent className="p-4 text-center">
                  <Icon className={`h-8 w-8 ${stat.color} mb-2 mx-auto`} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Stats */}
        <Card className="glass-effect border-gray-600">
          <CardContent className="p-0">
            <Tabs defaultValue="recent" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-3 bg-gaming-dark">
                  <TabsTrigger value="recent">Recent Matches</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="recent" className="mt-4">
                <div className="px-6 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Tournament Results</h3>
                  {registrationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 animate-pulse">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-700 rounded mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                          </div>
                          <div className="h-6 bg-gray-700 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentMatches.length === 0 ? (
                    <div className="text-center py-12">
                      <GamepadIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Matches Yet</h3>
                      <p className="text-gray-400">Join your first tournament to see results here!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentMatches.map((registration) => (
                        <div key={registration.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gaming-navy/30 hover:bg-gaming-navy/50 transition-colors">
                          <img
                            src={registration.tournament?.game === "PUBG" 
                              ? "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                              : "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                            }
                            alt={registration.tournament?.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{registration.tournament?.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <span>{formatDate(registration.registeredAt!)}</span>
                              <span>•</span>
                              <span>{registration.kills} kills</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {getPositionBadge(registration.position)}
                            <div className="text-right">
                              <div className={`font-semibold ${
                                parseFloat(registration.earnings || "0") > 0 ? "text-gaming-green" : "text-gray-400"
                              }`}>
                                ₹{registration.earnings || "0"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="mt-4">
                <div className="px-6 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Achievements & Milestones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gaming-navy/30 border border-gaming-amber/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <Trophy className="h-6 w-6 text-gaming-amber" />
                        <span className="font-semibold text-gaming-amber">Tournament Master</span>
                      </div>
                      <p className="text-sm text-gray-400">Won {user?.tournamentsWon} tournaments</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gaming-navy/30 border border-gaming-green/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <TrendingUp className="h-6 w-6 text-gaming-green" />
                        <span className="font-semibold text-gaming-green">High Earner</span>
                      </div>
                      <p className="text-sm text-gray-400">Earned ₹{user?.totalEarnings} in total</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gaming-navy/30 border border-gaming-cyan/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <GamepadIcon className="h-6 w-6 text-gaming-cyan" />
                        <span className="font-semibold text-gaming-cyan">Active Player</span>
                      </div>
                      <p className="text-sm text-gray-400">Played {user?.gamesPlayed} tournaments</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gaming-navy/30 border border-gaming-purple/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="h-6 w-6 text-gaming-purple" />
                        <span className="font-semibold text-gaming-purple">Veteran</span>
                      </div>
                      <p className="text-sm text-gray-400">Member since {formatDate(user?.createdAt!)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="px-6 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gaming-navy/30">
                      <div>
                        <h4 className="font-medium text-white">Email Notifications</h4>
                        <p className="text-sm text-gray-400">Receive updates about tournaments and results</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-gray-600">
                        Manage
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gaming-navy/30">
                      <div>
                        <h4 className="font-medium text-white">Privacy Settings</h4>
                        <p className="text-sm text-gray-400">Control who can see your profile and stats</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-gray-600">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gaming-navy/30">
                      <div>
                        <h4 className="font-medium text-white">Account Security</h4>
                        <p className="text-sm text-gray-400">Change password and enable two-factor authentication</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-gray-600">
                        Update
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <Button variant="outline" className="w-full border-gaming-red text-gaming-red hover:bg-gaming-red hover:text-white">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
