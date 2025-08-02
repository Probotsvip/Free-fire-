import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, Minus, History, Gift, ArrowUpRight, ArrowDownLeft, Heart, Zap, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, User, SpinWheelReward, SpinHistory } from "@shared/schema";

export default function WalletPage() {
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"upi" | "gift_card">("upi");
  const [upiId, setUpiId] = useState("");
  const [giftCardType, setGiftCardType] = useState("google_play");
  const [spinRewards, setSpinRewards] = useState<SpinWheelReward[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock user ID - in a real app, this would come from authentication
  const userId = "cb5ba8ee-cf7c-4a17-8e30-c57c7e368561"; // Using the actual user ID from auth

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/users", userId, "transactions"],
  });

  const { data: dilData, isLoading: dilLoading } = useQuery({
    queryKey: ["/api/users", userId, "dil-balance"],
  });

  const { data: spinRewardsData } = useQuery<SpinWheelReward[]>({
    queryKey: ["/api/spin-wheel/rewards"],
  });

  const { data: spinHistory = [] } = useQuery<SpinHistory[]>({
    queryKey: ["/api/users", userId, "spin-history"],
  });

  const { data: dailyBonusAvailable } = useQuery({
    queryKey: ["/api/users", userId, "daily-bonus/available"],
  });

  const addMoneyMutation = useMutation({
    mutationFn: (amount: string) => 
      apiRequest("POST", `/api/users/${userId}/add-money`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "transactions"] });
      toast({
        title: "Money Added Successfully",
        description: `₹${addAmount} has been added to your wallet.`,
      });
      setAddAmount("");
    },
    onError: () => {
      toast({
        title: "Failed to Add Money",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", `/api/users/${userId}/withdraw`, data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "transactions"] });
      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal will be processed in ${response.processingTime}`,
      });
      setWithdrawAmount("");
      setUpiId("");
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const spinWheelMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/spin-wheel/spin", { dilCost: 10 }),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "dil-balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "spin-history"] });
      
      toast({
        title: "🎉 Spin Result!",
        description: `You won ${result.reward.type === "cash" ? "₹" + result.reward.value : result.reward.value + " DIL"}!`,
      });
      setIsSpinning(false);
    },
    onError: (error: any) => {
      toast({
        title: "Spin Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setIsSpinning(false);
    },
  });

  const claimDailyBonusMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/users/${userId}/daily-bonus/claim`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "dil-balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "daily-bonus/available"] });
      toast({
        title: "Daily Bonus Claimed!",
        description: "You received ₹10 + 5 DIL",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bonus Claim Failed",
        description: error.message || "Already claimed today",
        variant: "destructive",
      });
    },
  });

  const handleAddMoney = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    addMoneyMutation.mutate(addAmount);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    if (withdrawMethod === "upi" && !upiId) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID.",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      amount: withdrawAmount,
      method: withdrawMethod,
      upiId: withdrawMethod === "upi" ? upiId : undefined,
      giftCardType: withdrawMethod === "gift_card" ? giftCardType : undefined,
    });
  };

  const handleSpinWheel = () => {
    if (!dilData || dilData.dilBalance < 10) {
      toast({
        title: "Insufficient DIL",
        description: "You need at least 10 DIL to spin.",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    spinWheelMutation.mutate();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-gaming-green" />;
      case "withdraw":
        return <ArrowUpRight className="h-4 w-4 text-gaming-red" />;
      case "entry_fee":
        return <ArrowUpRight className="h-4 w-4 text-gaming-red" />;
      case "prize_money":
        return <ArrowDownLeft className="h-4 w-4 text-gaming-green" />;
      default:
        return <History className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (userLoading) {
    return (
      <main className="pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <Wallet className="mr-3 h-8 w-8 text-gaming-cyan" />
            My Wallet
          </h1>
          <p className="text-gray-400">Manage your gaming funds and transaction history</p>
        </div>

        {/* Enhanced Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-effect border-gray-600">
            <CardContent className="p-6 text-center">
              <Wallet className="h-8 w-8 text-gaming-cyan mb-3 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Cash Balance</h3>
              <div className="text-2xl font-bold text-gaming-green">
                ₹{user?.balance || "0.00"}
              </div></CardContent>
          </Card>

          <Card className="glass-effect border-gray-600">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-gaming-red mb-3 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">DIL Balance</h3>
              <div className="text-2xl font-bold text-gaming-red">
                {dilData?.dilBalance || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gray-600">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-gaming-amber mb-3 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Medals</h3>
              <div className="text-2xl font-bold text-gaming-amber">
                {user?.medals || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gray-600">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-gaming-purple mb-3 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Total DIL Earned</h3>
              <div className="text-2xl font-bold text-gaming-purple">
                {dilData?.totalDilEarned || 0}
              </div></CardContent>
          </Card>
        </div>

        {/* Daily Bonus Banner */}
        {dailyBonusAvailable?.available && (
          <Card className="bg-gradient-to-r from-gaming-purple/20 to-gaming-cyan/20 border-gaming-border mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="h-6 w-6 text-gaming-amber" />
                  <div>
                    <h3 className="font-semibold text-gaming-amber">Daily Bonus Available!</h3>
                    <p className="text-sm text-gray-400">Claim your ₹10 + 5 DIL daily reward</p>
                  </div>
                </div>
                <Button
                  onClick={() => claimDailyBonusMutation.mutate()}
                  disabled={claimDailyBonusMutation.isPending}
                  className="bg-gaming-amber hover:bg-gaming-amber/80 text-gaming-dark"
                >
                  {claimDailyBonusMutation.isPending ? "Claiming..." : "Claim Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-effect border-gray-600">
            <CardContent className="p-6 text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-3 w-full bg-gaming-cyan hover:bg-cyan-400 text-gaming-dark">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gaming-navy border-gray-600 text-white">
                  <DialogHeader>
                    <DialogTitle>Add Money to Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="bg-gaming-dark border-gray-600 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["100", "500", "1000", "2000"].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setAddAmount(amount)}
                          className="border-gray-600 hover:bg-gaming-cyan hover:text-gaming-dark"
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                    <Button
                      onClick={handleAddMoney}
                      disabled={addMoneyMutation.isPending}
                      className="w-full bg-gaming-cyan hover:bg-cyan-400 text-gaming-dark"
                    >
                      {addMoneyMutation.isPending ? "Processing..." : "Add Money"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gray-600">
            <CardContent className="p-6 text-center">
              <Minus className="h-8 w-8 text-gaming-amber mb-3 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">UPI Withdrawal</h3>
              <div className="text-sm text-gaming-amber mb-3">
                Min: ₹50 | Processing: 2-24 hrs
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gaming-amber hover:bg-yellow-400 text-gaming-dark">
                    <Minus className="mr-2 h-4 w-4" />
                    Withdraw to UPI
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gaming-navy border-gray-600 text-white">
                  <DialogHeader>
                    <DialogTitle>UPI Withdrawal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="withdraw-amount">Amount (₹)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Minimum ₹50"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-gaming-dark border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="upi-id">UPI ID</Label>
                      <Input
                        id="upi-id"
                        type="text"
                        placeholder="example@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="bg-gaming-dark border-gray-600 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleWithdraw}
                      disabled={withdrawMutation.isPending}
                      className="w-full bg-gaming-amber hover:bg-yellow-400 text-gaming-dark"
                    >
                      {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="glass-effect border-gray-600">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-gaming-red mb-3 mx-auto" />
              <h3 className="text-sm text-gray-400 mb-1">Spin Wheel</h3>
              <div className="text-sm text-gaming-red mb-3">
                Cost: 10 DIL | Win Cash & DIL
              </div>
              <Button 
                onClick={handleSpinWheel}
                disabled={spinWheelMutation.isPending || isSpinning || (dilData?.dilBalance || 0) < 10}
                className="w-full bg-gaming-red hover:bg-red-600 text-white"
              >
                <Zap className="mr-2 h-4 w-4" />
                {isSpinning ? "Spinning..." : "Spin Now"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="glass-effect border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <History className="mr-2 h-5 w-5 text-gaming-cyan" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="px-6 pt-2">
                <TabsList className="grid w-full grid-cols-4 bg-gaming-dark">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="deposit">Deposits</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdrawals</TabsTrigger>
                  <TabsTrigger value="prize_money">Winnings</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-4">
                {transactionsLoading ? (
                  <div className="space-y-4 p-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </div>
                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
                    <p className="text-gray-400">Your transaction history will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-4 p-4 hover:bg-gaming-navy/30 transition-colors">
                        <div className="w-10 h-10 bg-gaming-navy rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-white">{transaction.description}</div>
                          <div className="text-sm text-gray-400">
                            {formatDate(transaction.createdAt!)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-bold text-lg ${
                            parseFloat(transaction.amount) > 0 ? "text-gaming-green" : "text-gaming-red"
                          }`}>
                            {parseFloat(transaction.amount) > 0 ? "+" : ""}₹{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {transaction.type.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Other tab contents would filter transactions by type */}
              <TabsContent value="deposit" className="mt-4">
                <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                  {transactions
                    .filter(t => t.type === "deposit")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-4 p-4 hover:bg-gaming-navy/30 transition-colors">
                        <div className="w-10 h-10 bg-gaming-navy rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-white">{transaction.description}</div>
                          <div className="text-sm text-gray-400">
                            {formatDate(transaction.createdAt!)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-lg text-gaming-green">
                            +₹{parseFloat(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="withdraw" className="mt-4">
                <div className="text-center py-12">
                  <Minus className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Withdrawals</h3>
                  <p className="text-gray-400">Withdrawal feature coming soon!</p>
                </div>
              </TabsContent>

              <TabsContent value="prize_money" className="mt-4">
                <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                  {transactions
                    .filter(t => t.type === "prize_money")
                    .map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-4 p-4 hover:bg-gaming-navy/30 transition-colors">
                        <div className="w-10 h-10 bg-gaming-navy rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-white">{transaction.description}</div>
                          <div className="text-sm text-gray-400">
                            {formatDate(transaction.createdAt!)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-lg text-gaming-green">
                            +₹{parseFloat(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
