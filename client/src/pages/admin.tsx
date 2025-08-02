import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Trophy, 
  Plus, 
  Settings, 
  Crown, 
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  MapPin,
  Clock,
  UserCheck
} from "lucide-react";

interface Tournament {
  id: string;
  title: string;
  game: string;
  gameMode: string;
  map: string;
  prizePool: string;
  entryFee: string;
  maxPlayers: number;
  currentPlayers: number;
  status: "upcoming" | "live" | "completed";
  startTime: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  roomId: string;
  roomPassword: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  balance: string;
  totalEarnings: string;
  tournamentsWon: number;
  gamesPlayed: number;
  role: string;
  createdAt: string;
  lastLogin: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [newTournament, setNewTournament] = useState({
    title: "",
    description: "",
    game: "PUBG",
    gameMode: "squad",
    map: "",
    prizePool: "",
    entryFee: "",
    maxPlayers: 100,
    firstPrize: "",
    secondPrize: "",
    thirdPrize: "",
    startTime: "",
    roomId: "",
    roomPassword: "",
  });

  // Fetch tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  // Fetch users for leaderboard
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard?limit=50"],
  });

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData: any) => {
      return await apiRequest("POST", "/api/tournaments", tournamentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Tournament Created! 🏆",
        description: "New tournament has been created successfully",
      });
      setNewTournament({
        title: "",
        description: "",
        game: "PUBG",
        gameMode: "squad",
        map: "",
        prizePool: "",
        entryFee: "",
        maxPlayers: 100,
        firstPrize: "",
        secondPrize: "",
        thirdPrize: "",
        startTime: "",
        roomId: "",
        roomPassword: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Tournament",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTournament.title || !newTournament.prizePool || !newTournament.entryFee) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTournamentMutation.mutate({
      ...newTournament,
      status: "upcoming",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      upcoming: "outline",
      live: "default",
      completed: "secondary",
    };
    
    const colors: { [key: string]: string } = {
      upcoming: "text-blue",
      live: "text-success",
      completed: "text-muted-foreground",
    };

    return (
      <Badge variant={variants[status] || "default"} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    totalTournaments: tournaments.length,
    liveTournaments: tournaments.filter((t: Tournament) => t.status === "live").length,
    totalUsers: users.length,
    totalPrizePool: tournaments.reduce((sum: number, t: Tournament) => sum + parseFloat(t.prizePool), 0),
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage tournaments, users, and monitor platform activity</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="premium-glass border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalTournaments}</div>
              </CardContent>
            </Card>

            <Card className="premium-glass border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Tournaments</CardTitle>
                <Target className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.liveTournaments}</div>
              </CardContent>
            </Card>

            <Card className="premium-glass border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="premium-glass border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prize Pool</CardTitle>
                <DollarSign className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">₹{stats.totalPrizePool.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tournaments */}
          <Card className="premium-glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Tournaments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournamentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tournaments.slice(0, 5).map((tournament: Tournament) => (
                    <div key={tournament.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="space-y-1">
                        <h4 className="font-medium">{tournament.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {tournament.game}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {tournament.currentPlayers}/{tournament.maxPlayers}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ₹{tournament.prizePool}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(tournament.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-6">
          <Card className="premium-glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                All Tournaments
              </CardTitle>
              <CardDescription>Manage and monitor tournament activity</CardDescription>
            </CardHeader>
            <CardContent>
              {tournamentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tournaments.map((tournament: Tournament) => (
                    <div key={tournament.id} className="p-4 rounded-lg border border-border bg-secondary/30">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{tournament.title}</h3>
                            {getStatusBadge(tournament.status)}
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span>{tournament.game} - {tournament.gameMode}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{tournament.map || "TBA"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                              <span>{tournament.currentPlayers}/{tournament.maxPlayers} players</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(tournament.startTime).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-success font-medium">Prize Pool: ₹{tournament.prizePool}</span>
                            <span className="text-muted-foreground">Entry Fee: ₹{tournament.entryFee}</span>
                          </div>
                          {tournament.roomId && (
                            <div className="flex items-center gap-4 text-sm bg-secondary/50 p-2 rounded">
                              <span><strong>Room ID:</strong> {tournament.roomId}</span>
                              <span><strong>Password:</strong> {tournament.roomPassword}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          {tournament.status === "live" && (
                            <Button size="sm" className="success-button">
                              <Crown className="h-4 w-4 mr-2" />
                              Results
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="premium-glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Monitor user activity and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user: User, index: number) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-blue flex items-center justify-center font-bold text-white">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{user.username}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="text-success font-medium">₹{user.totalEarnings}</span>
                          <span className="text-muted-foreground ml-2">earned</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{user.tournamentsWon} wins</span>
                          <span>{user.gamesPlayed} games</span>
                          <span>₹{user.balance} balance</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Tournament Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card className="premium-glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Tournament
              </CardTitle>
              <CardDescription>Set up a new gaming tournament</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTournament} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tournament Title *</Label>
                    <Input
                      id="title"
                      value={newTournament.title}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter tournament title"
                      className="bg-secondary border-border text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="game">Game *</Label>
                    <Select value={newTournament.game} onValueChange={(value) => setNewTournament(prev => ({ ...prev, game: value }))}>
                      <SelectTrigger className="bg-secondary border-border text-white">
                        <SelectValue placeholder="Select game" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBG">PUBG Mobile</SelectItem>
                        <SelectItem value="FREE_FIRE">Free Fire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gameMode">Game Mode</Label>
                    <Select value={newTournament.gameMode} onValueChange={(value) => setNewTournament(prev => ({ ...prev, gameMode: value }))}>
                      <SelectTrigger className="bg-secondary border-border text-white">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="duo">Duo</SelectItem>
                        <SelectItem value="squad">Squad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="map">Map</Label>
                    <Input
                      id="map"
                      value={newTournament.map}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, map: e.target.value }))}
                      placeholder="e.g., Erangel, Sanhok"
                      className="bg-secondary border-border text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prizePool">Prize Pool (₹) *</Label>
                    <Input
                      id="prizePool"
                      type="number"
                      value={newTournament.prizePool}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, prizePool: e.target.value }))}
                      placeholder="10000"
                      className="bg-secondary border-border text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee (₹) *</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      value={newTournament.entryFee}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: e.target.value }))}
                      placeholder="50"
                      className="bg-secondary border-border text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers">Max Players</Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      value={newTournament.maxPlayers}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                      placeholder="100"
                      className="bg-secondary border-border text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={newTournament.startTime}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, startTime: e.target.value }))}
                      className="bg-secondary border-border text-white"
                    />
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstPrize">1st Prize (₹)</Label>
                    <Input
                      id="firstPrize"
                      type="number"
                      value={newTournament.firstPrize}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, firstPrize: e.target.value }))}
                      placeholder="5000"
                      className="bg-secondary border-border text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondPrize">2nd Prize (₹)</Label>
                    <Input
                      id="secondPrize"
                      type="number"
                      value={newTournament.secondPrize}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, secondPrize: e.target.value }))}
                      placeholder="3000"
                      className="bg-secondary border-border text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thirdPrize">3rd Prize (₹)</Label>
                    <Input
                      id="thirdPrize"
                      type="number"
                      value={newTournament.thirdPrize}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, thirdPrize: e.target.value }))}
                      placeholder="2000"
                      className="bg-secondary border-border text-white"
                    />
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room ID</Label>
                    <Input
                      id="roomId"
                      value={newTournament.roomId}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, roomId: e.target.value }))}
                      placeholder="PUBG2024"
                      className="bg-secondary border-border text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomPassword">Room Password</Label>
                    <Input
                      id="roomPassword"
                      value={newTournament.roomPassword}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, roomPassword: e.target.value }))}
                      placeholder="pass123"
                      className="bg-secondary border-border text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTournament.description}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter tournament description"
                    className="bg-secondary border-border text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createTournamentMutation.isPending}
                  className="w-full gaming-button h-12 text-base font-bold"
                >
                  {createTournamentMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Tournament...
                    </div>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Create Tournament
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}