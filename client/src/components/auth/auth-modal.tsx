import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultView = "login" }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<"login" | "signup">(defaultView);

  const handleClose = () => {
    onClose();
    // Reset to login view after closing
    setTimeout(() => setCurrentView("login"), 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none overflow-hidden">
        <div className="animate-scale-in">
          {currentView === "login" ? (
            <LoginForm
              onSwitchToSignup={() => setCurrentView("signup")}
              onClose={handleClose}
            />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setCurrentView("login")}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}