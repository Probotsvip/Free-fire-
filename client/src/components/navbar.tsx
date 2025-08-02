import { Link, useLocation } from "wouter";
import { Home, Trophy, Crown, Wallet, User, Gamepad2 } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

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
      <header className="hidden md:block bg-gaming-navy/90 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Gamepad2 className="text-gaming-cyan text-2xl" />
                <span className="text-xl font-bold neon-text">GameWin</span>
              </Link>
              <nav className="flex space-x-6">
                {navItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`font-medium transition-colors ${
                      location === item.path
                        ? "text-gaming-cyan"
                        : "text-gray-300 hover:text-gaming-cyan"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-effect rounded-lg px-4 py-2">
                <span className="text-sm text-gray-300">Balance:</span>
                <span className="text-gaming-green font-semibold ml-2">₹2,850</span>
              </div>
              <button className="bg-gaming-cyan hover:bg-cyan-400 text-gaming-dark px-4 py-2 rounded-lg font-medium transition-colors">
                Add Cash
              </button>
              <Link href="/profile">
                <div className="w-8 h-8 bg-gaming-purple rounded-full flex items-center justify-center cursor-pointer">
                  <User className="text-sm" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-gaming-navy/90 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="flex justify-between items-center px-4 py-3">
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="text-gaming-cyan text-xl" />
            <span className="text-lg font-bold neon-text">GameWin</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="glass-effect rounded-lg px-3 py-1">
              <span className="text-xs text-gray-300">₹</span>
              <span className="text-gaming-green font-semibold text-sm">2,850</span>
            </div>
            <Link href="/profile">
              <div className="w-8 h-8 bg-gaming-purple rounded-full flex items-center justify-center cursor-pointer">
                <User className="text-xs" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gaming-navy/90 backdrop-blur-lg border-t border-gray-700 z-50 md:hidden">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-2 px-3 transition-colors ${
                  location === item.path
                    ? "text-gaming-cyan"
                    : "text-gray-400 hover:text-gaming-cyan"
                }`}
              >
                <Icon className="text-lg" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
