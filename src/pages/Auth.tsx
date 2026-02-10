import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Check your email to verify your account! ✉️");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error("Oops, that memory slipped away—check your credentials!");
      } else {
        toast.success("Welcome back, memory keeper! ✨");
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🕰️</span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {isSignUp ? "Start Your Journey" : "Welcome Back"}
          </h1>
          <p className="font-body text-muted-foreground">
            {isSignUp
              ? "Create an account to begin preserving memories"
              : "Sign in to revisit your time capsules"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name" className="font-body">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Memory Keeper"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 font-body"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="font-body">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 font-body"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-body">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 font-body"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full font-body rounded-full gap-2"
            disabled={submitting}
          >
            {submitting ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-medium hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
