import { Link, useLocation } from "react-router-dom";
import { BookOpen, Plus, Sparkles, Home, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const { user, displayName, signOut } = useAuth();

  const links = [
    { to: "/", icon: Home, label: "Home", auth: false },
    { to: "/dashboard", icon: BookOpen, label: "My Capsules", auth: true },
    { to: "/create", icon: Plus, label: "New Capsule", auth: true },
    { to: "/prompts", icon: Sparkles, label: "Prompts", auth: true },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-surface border-b"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🕰️</span>
          <span className="font-display text-xl font-bold text-foreground">
            Memory Lane
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links
            .filter((l) => !l.auth || user)
            .map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="hidden sm:inline text-sm font-body text-muted-foreground">
                {displayName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="gap-2 ml-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
