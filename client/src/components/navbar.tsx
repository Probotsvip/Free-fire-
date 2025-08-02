import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Trophy, Crown, Wallet, User, Gamepad2, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/auth/auth-modal";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">("login");

  const openAuthModal = (view: "login" | "signup") => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/tournaments", label: "Tournaments", icon: Trophy },
    { path: "/leaderboard", label: "Leaderboard", icon: Crown },
    { path: "/wallet", label: "Wallet", icon: Wallet },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block premium-glass border-b border-border sticky top-0 z-40 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2 mobile-optimized">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue to-purple flex items-center justify-center">
                  <Gamepad2 className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold gradient-text">GameWin</span>
              </Link>
              <nav className="flex space-x-6">
                {navItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`font-semibold transition-colors mobile-optimized ${
                      location === item.path
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="premium-glass rounded-lg px-4 py-2">
                    <span className="text-sm text-muted-foreground">Balance:</span>
                    <span className="text-success font-bold ml-2">₹{user?.balance || "0.00"}</span>
                  </div>
                  <Button className="success-button px-4 py-2 text-sm font-bold">
                    Add Cash
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Link href="/profile" className="mobile-optimized">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-blue flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <User className="text-white text-sm" />
                      </div>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-danger mobile-optimized"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => openAuthModal("login")}
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary font-medium mobile-optimized"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button
                    onClick={() => openAuthModal("signup")}
                    className="gaming-button px-4 py-2 text-sm font-bold"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden premium-glass border-b border-border sticky top-0 z-40 safe-top">
        <div className="flex justify-between items-center px-4 py-3">
          <Link href="/" className="flex items-center space-x-2 mobile-optimized">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue to-purple flex items-center justify-center">
              <Gamepad2 className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold gradient-text">GameWin</span>
          </Link>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="premium-glass rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground">₹</span>
                  <span className="text-success font-bold text-sm ml-1">{user?.balance || "0"}</span>
                </div>
                <Link href="/profile" className="mobile-optimized">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple to-blue flex items-center justify-center cursor-pointer hover:scale-110 transition-transform active:scale-95">
                    <User className="text-white text-sm" />
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Button
                  onClick={() => openAuthModal("login")}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary mobile-optimized"
                >
                  Login
                </Button>
                <Button
                  onClick={() => openAuthModal("signup")}
                  size="sm"
                  className="gaming-button px-3 py-1 text-xs font-bold"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 mobile-nav border-t border-border z-50 md:hidden safe-bottom">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all mobile-optimized ${
                  isActive
                    ? "text-primary bg-primary/10 scale-105"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5 active:scale-95"
                }`}
              >
                <div className={`p-1 rounded-lg transition-all ${
                  isActive ? "bg-primary/20" : ""
                }`}>
                  <Icon className={`transition-all ${
                    isActive ? "text-xl text-primary" : "text-lg"
                  }`} />
                </div>
                <span className={`text-xs mt-1 font-medium transition-all ${
                  isActive ? "font-bold" : ""
                }`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultView={authModalView}
      />
    </>
  );
}