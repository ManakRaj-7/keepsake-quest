import { useParams, Link } from "react-router-dom";
import { useCapsules } from "@/context/CapsuleContext";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Lock, Unlock, Users, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const CapsuleDetail = () => {
  const { id } = useParams();
  const { getCapsule } = useCapsules();
  const capsule = getCapsule(id || "");
  const confettiFired = useRef(false);

  useEffect(() => {
    if (capsule && !capsule.isLocked && !confettiFired.current) {
      confettiFired.current = true;
      // Gentle confetti for unlocked capsules
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.4 },
        colors: ["#c8956c", "#d4a574", "#e8c9a0", "#f0dcc0"],
        gravity: 0.8,
      });
    }
  }, [capsule]);

  if (!capsule) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl text-muted-foreground">
          Oops, that memory slipped away... 💨
        </p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4 font-body rounded-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const unlockDate = new Date(capsule.unlockDate);
  const daysUntilUnlock = Math.ceil(
    (unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto max-w-2xl px-6 py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to capsules
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-4">
          {capsule.isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium capsule-locked font-body">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capsule-unlocked font-body">
              <Unlock className="h-3 w-3" />
              Unlocked
            </span>
          )}
          {capsule.isShared && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground font-body">
              <Users className="h-3 w-3" />
              Shared
            </span>
          )}
        </div>

        <h1 className="font-display text-4xl font-bold text-foreground mb-3">
          {capsule.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground font-body mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Created {new Date(capsule.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {capsule.isLocked
              ? `Opens in ${daysUntilUnlock} day${daysUntilUnlock !== 1 ? "s" : ""}`
              : `Opened ${unlockDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
          </span>
        </div>

        {capsule.isLocked ? (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="rounded-2xl bg-card p-10 text-center warm-glow"
          >
            <Lock className="h-16 w-16 mx-auto mb-4 capsule-locked animate-float" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              This capsule is still sealed
            </h2>
            <p className="font-body text-muted-foreground mb-4">
              {daysUntilUnlock > 30
                ? "Patience... some memories are worth waiting for."
                : daysUntilUnlock > 7
                ? "Almost there! The anticipation makes it sweeter."
                : "So close! Just a few more days..."}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-body">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{daysUntilUnlock}</span>
              <span className="text-muted-foreground">days remaining</span>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-card p-8">
              <p className="font-body text-foreground text-lg leading-relaxed mb-4">
                {capsule.description}
              </p>
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-primary" />
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                    Your notes
                  </p>
                </div>
                <p className="font-display italic text-foreground leading-relaxed">
                  "{capsule.notes}"
                </p>
              </div>
            </div>

            {/* Tags */}
            {capsule.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {capsule.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground font-body"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Shared with */}
            {capsule.isShared && capsule.sharedWith.length > 0 && (
              <div className="rounded-xl bg-muted p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Shared with
                </p>
                <div className="flex flex-wrap gap-2">
                  {capsule.sharedWith.map((email) => (
                    <span
                      key={email}
                      className="rounded-full bg-card px-3 py-1 text-xs font-body text-foreground"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CapsuleDetail;
