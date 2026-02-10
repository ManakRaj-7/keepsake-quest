import { useCapsules } from "@/context/CapsuleContext";
import CapsuleCard from "@/components/CapsuleCard";
import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const { capsules } = useCapsules();
  const [filter, setFilter] = useState<"all" | "locked" | "unlocked">("all");

  const filtered = capsules.filter((c) => {
    if (filter === "locked") return c.isLocked;
    if (filter === "unlocked") return !c.isLocked;
    return true;
  });

  const lockedCount = capsules.filter((c) => c.isLocked).length;
  const unlockedCount = capsules.filter((c) => !c.isLocked).length;

  return (
    <div className="container mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">
          Welcome back, memory keeper ✨
        </h1>
        <p className="font-body text-muted-foreground text-lg">
          You have {lockedCount} locked capsule{lockedCount !== 1 ? "s" : ""} waiting and{" "}
          {unlockedCount} unlocked memor{unlockedCount !== 1 ? "ies" : "y"} to revisit.
        </p>
      </motion.div>

      {/* Filter */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((capsule, i) => (
          <CapsuleCard key={capsule.id} capsule={capsule} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-muted-foreground">
            No capsules here yet...
          </p>
          <p className="font-body text-muted-foreground mt-2">
            Time to create a new memory!
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
