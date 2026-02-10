import { Capsule, getPublicUrl } from "@/hooks/useCapsules";
import { Lock, Unlock, Users, Calendar, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface CapsuleCardProps {
  capsule: Capsule;
  index: number;
}

const CapsuleCard = ({ capsule, index }: CapsuleCardProps) => {
  const rotations = [-2, 1, -1, 2, 0];
  const rotation = rotations[index % rotations.length];
  const isLocked = new Date(capsule.unlock_date) > new Date();
  const firstPhoto = capsule.capsule_photos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/capsule/${capsule.id}`}>
        <div
          className="polaroid-card group cursor-pointer"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Photo area */}
          <div className={`aspect-[4/3] rounded-md mb-3 flex items-center justify-center overflow-hidden ${
            isLocked ? "bg-muted" : "bg-secondary"
          }`}>
            {firstPhoto && !isLocked ? (
              <img
                src={getPublicUrl(firstPhoto.storage_path)}
                alt={capsule.title}
                className="w-full h-full object-cover sepia-overlay"
              />
            ) : isLocked ? (
              <div className="text-center">
                <Lock className="h-8 w-8 mx-auto mb-2 capsule-locked" />
                <p className="text-xs text-muted-foreground font-body">
                  Opens {new Date(capsule.unlock_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ) : (
              <div className="text-center p-4">
                <Unlock className="h-8 w-8 mx-auto mb-2 capsule-unlocked" />
                <p className="text-xs text-muted-foreground font-body italic">
                  "{capsule.notes.substring(0, 60)}{capsule.notes.length > 60 ? "..." : ""}"
                </p>
              </div>
            )}
          </div>

          <h3 className="font-display text-sm font-semibold text-card-foreground leading-tight mb-1">
            {capsule.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(capsule.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
            {capsule.is_shared && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Shared
              </span>
            )}
            {(capsule.capsule_photos?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Image className="h-3 w-3" />
                {capsule.capsule_photos?.length}
              </span>
            )}
          </div>

          {capsule.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {capsule.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default CapsuleCard;
