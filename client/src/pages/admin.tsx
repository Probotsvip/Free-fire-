import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Users, 
  Trophy, 
  DollarSign, 
  Gift,
  Zap,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Megaphone,
  Target,
  TrendingUp,
  Calendar,
  Image,
  Link
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Tournament, Advertisement, SpinWheelReward } from "@shared/schema";

export default function AdminPanel() {
  const [newAdData, setNewAdData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    type: "banner",
    position: "home_top",
    isActive: true,
    startDate: "",
    endDate: ""
  });

  const [newRewardData, setNewRewardData] = useState({
    type: "cash",
    value: "",
    probability: "",
    dilCost: 10
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin data
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const { data: advertisements = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/admin/advertisements"],
  });

  const { data: spinRewards = [] } = useQuery<SpinWheelReward[]>({
    queryKey: ["/api/spin-wheel/rewards"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });

  // Mutations
  const createAdMutation = useMutation({
    mutationFn: (adData: any) => apiRequest("POST", "/api/admin/advertisements", adData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      toast({ title: "Advertisement Created", description: "New ad campaign has been created successfully." });
      setNewAdData({
        title: "",
        description: "",
        imageUrl: "",
        targetUrl: "",
        type: "banner",
        position: "home_top",
        isActive: true,
        startDate: "",
        endDate: ""
      });
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PATCH", `/api/admin/advertisements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      toast({ title: "Advertisement Updated", description: "Ad campaign has been updated successfully." });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/advertisements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      toast({ title: "Advertisement Deleted", description: "Ad campaign has been deleted." });
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: (rewardData: any) => apiRequest("POST", "/api/admin/spin-rewards", rewardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spin-wheel/rewards"] });
      toast({ title: "Reward Created", description: "New spin wheel reward has been added." });
      setNewRewardData({
        type: "cash",
        value: "",
        probability: "",
        dilCost: 10
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/admin/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User Status Updated", description: "User status has been changed." });
    },
  });

  const handleCreateAd = () => {
    if (!newAdData.title || !newAdData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createAdMutation.mutate(newAdData);
  };

  const handleCreateReward = () => {
    if (!newRewardData.value || !newRewardData.probability) {
      toast({
        title: "Missing Information", 
        description: "Please fill in reward value and probability.",
        variant: "destructive",
      });
      return;
    }
    createRewardMutation.mutate(newRewardData);
  };

  const getAdTypeColor = (type: string) => {
    switch (type) {
      case "banner": return "bg-blue-500";
      case "popup": return "bg-red-500";
      case "native": return "bg-green-500";
      case "video": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <main className="pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <Settings className="mr-3 h-8 w-8 text-gaming-cyan" />
            Admin Panel
          </h1>
          <p className="text-gray-400">Manage your GameWin platform</p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-effect border-gray-600">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-gaming-cyan mb-2 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Total Users</h3>
              <div className="text-2xl font-bold text-gaming-cyan">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gray-600">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-gaming-amber mb-2 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Active Tournaments</h3>
              <div className="text-2xl font-bold text-gaming-amber">
                {tournaments.filter(t => t.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gray-600">
            <CardContent className="p-4 text-center">
              <Megaphone className="h-6 w-6 text-gaming-green mb-2 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Active Ads</h3>
              <div className="text-2xl font-bold text-gaming-green">
                {advertisements.filter(ad => ad.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gray-600">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-gaming-purple mb-2 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Revenue</h3>
              <div className="text-2xl font-bold text-gaming-purple">
                ₹{analytics?.totalRevenue || "0"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="advertisements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gaming-navy border-gray-600">
            <TabsTrigger value="advertisements">
              <Megaphone className="mr-2 h-4 w-4" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="tournaments">
              <Trophy className="mr-2 h-4 w-4" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Gift className="mr-2 h-4 w-4" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Advertisements Tab */}
          <TabsContent value="advertisements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Advertisement Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gaming-cyan hover:bg-cyan-400 text-gaming-dark">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Ad Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gaming-navy border-gray-600 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Advertisement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ad-title">Campaign Title</Label>
                        <Input
                          id="ad-title"
                          value={newAdData.title}
                          onChange={(e) => setNewAdData({...newAdData, title: e.target.value})}
                          className="bg-gaming-dark border-gray-600 text-white"
                          placeholder="Enter campaign title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ad-type">Ad Type</Label>
                        <Select value={newAdData.type} onValueChange={(value) => setNewAdData({...newAdData, type: value})}>
                          <SelectTrigger className="bg-gaming-dark border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="banner">Banner</SelectItem>
                            <SelectItem value="popup">Popup</SelectItem>
                            <SelectItem value="native">Native</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ad-description">Description</Label>
                      <Textarea
                        id="ad-description"
                        value={newAdData.description}
                        onChange={(e) => setNewAdData({...newAdData, description: e.target.value})}
                        className="bg-gaming-dark border-gray-600 text-white"
                        placeholder="Enter ad description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ad-image">Image URL</Label>
                        <Input
                          id="ad-image"
                          value={newAdData.imageUrl}
                          onChange={(e) => setNewAdData({...newAdData, imageUrl: e.target.value})}
                          className="bg-gaming-dark border-gray-600 text-white"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ad-target">Target URL</Label>
                        <Input
                          id="ad-target"
                          value={newAdData.targetUrl}
                          onChange={(e) => setNewAdData({...newAdData, targetUrl: e.target.value})}
                          className="bg-gaming-dark border-gray-600 text-white"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ad-position">Position</Label>
                        <Select value={newAdData.position} onValueChange={(value) => setNewAdData({...newAdData, position: value})}>
                          <SelectTrigger className="bg-gaming-dark border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home_top">Home Top</SelectItem>
                            <SelectItem value="home_bottom">Home Bottom</SelectItem>
                            <SelectItem value="tournaments">Tournaments</SelectItem>
                            <SelectItem value="wallet">Wallet</SelectItem>
                            <SelectItem value="profile">Profile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ad-start">Start Date</Label>
                        <Input
                          id="ad-start"
                          type="datetime-local"
                          value={newAdData.startDate}
                          onChange={(e) => setNewAdData({...newAdData, startDate: e.target.value})}
                          className="bg-gaming-dark border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ad-end">End Date</Label>
                        <Input
                          id="ad-end"
                          type="datetime-local"
                          value={newAdData.endDate}
                          onChange={(e) => setNewAdData({...newAdData, endDate: e.target.value})}
                          className="bg-gaming-dark border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateAd}
                      disabled={createAdMutation.isPending}
                      className="w-full bg-gaming-cyan hover:bg-cyan-400 text-gaming-dark"
                    >
                      {createAdMutation.isPending ? "Creating..." : "Create Campaign"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Advertisements List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {advertisements.map((ad) => (
                <Card key={ad.id} className="glass-effect border-gray-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-white">{ad.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${getAdTypeColor(ad.type)} text-white`}>
                            {ad.type}
                          </Badge>
                          <Badge variant={ad.isActive ? "default" : "secondary"}>
                            {ad.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAdMutation.mutate({
                            id: ad.id,
                            data: { isActive: !ad.isActive }
                          })}
                        >
                          {ad.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAdMutation.mutate(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-3">{ad.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {ad.position}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {ad.impressions || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {ad.clicks || 0} clicks
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">User Management</h2>
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => (
                <Card key={user.id} className="glass-effect border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gaming-cyan rounded-full flex items-center justify-center">
                          <span className="text-gaming-dark font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{user.username}</h3>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Active' : 'Banned'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Balance</p>
                          <p className="font-bold text-gaming-green">₹{user.balance}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">DIL</p>
                          <p className="font-bold text-gaming-red">{user.dilBalance}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={user.isActive ? "destructive" : "default"}
                          onClick={() => toggleUserStatusMutation.mutate({
                            userId: user.id,
                            isActive: !user.isActive
                          })}
                        >
                          {user.isActive ? "Ban" : "Unban"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs would continue here... */}
          <TabsContent value="tournaments">
            <h2 className="text-xl font-semibold text-white">Tournament Management</h2>
            <p className="text-gray-400">Tournament management features coming soon...</p>
          </TabsContent>

          <TabsContent value="rewards">
            <h2 className="text-xl font-semibold text-white">Spin Wheel Rewards</h2>
            <p className="text-gray-400">Spin wheel reward management features coming soon...</p>
          </TabsContent>

          <TabsContent value="analytics">
            <h2 className="text-xl font-semibold text-white">Platform Analytics</h2>
            <p className="text-gray-400">Analytics dashboard coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}