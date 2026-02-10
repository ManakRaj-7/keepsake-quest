import { useCapsules } from "@/hooks/useCapsules";
import CapsuleCard from "@/components/CapsuleCard";
import { motion } from "framer-motion";
import { Lock, Unlock, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { displayName } = useAuth();
  const { data: capsules = [], isLoading } = useCapsules();
  const [filter, setFilter] = useState<"all" | "locked" | "unlocked">("all");

  const now = new Date();
  const filtered = capsules.filter((c) => {
    const isLocked = new Date(c.unlock_date) > now;
    if (filter === "locked") return isLocked;
    if (filter === "unlocked") return !isLocked;
    return true;
  });

  const lockedCount = capsules.filter((c) => new Date(c.unlock_date) > now).length;
  const unlockedCount = capsules.length - lockedCount;

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-body text-muted-foreground animate-pulse">Loading your memories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-start justify-between"
      >
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Welcome back, {displayName || "memory keeper"} ✨
          </h1>
          <p className="font-body text-muted-foreground text-lg">
            {capsules.length === 0
              ? "Your memory lane is empty — time to create your first capsule!"
              : `You have ${lockedCount} locked capsule${lockedCount !== 1 ? "s" : ""} waiting and ${unlockedCount} unlocked memor${unlockedCount !== 1 ? "ies" : "y"} to revisit.`}
          </p>
        </div>
        <Link to="/create">
          <Button className="font-body rounded-full gap-2">
            <Plus className="h-4 w-4" />
            New Capsule
          </Button>
        </Link>
      </motion.div>

      {capsules.length > 0 && (
        <div className="flex gap-2 mb-8">
          {[
            { key: "all" as const, label: "All", count: capsules.length },
            { key: "unlocked" as const, label: "Unlocked", count: unlockedCount, icon: Unlock },
            { key: "locked" as const, label: "Locked", count: lockedCount, icon: Lock },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-body font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.icon && <f.icon className="h-3.5 w-3.5" />}
              {f.label}
              <span className="ml-1 opacity-70">({f.count})</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((capsule, i) => (
          <CapsuleCard key={capsule.id} capsule={capsule} index={i} />
        ))}
      </div>

      {filtered.length === 0 && capsules.length > 0 && (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-muted-foreground">
            No capsules match this filter...
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
