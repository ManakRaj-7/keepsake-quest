import { useParams, Link } from "react-router-dom";
import { useCapsule, getPublicUrl } from "@/hooks/useCapsules";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Lock, Unlock, Users, Clock, Heart, Image, Film, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const CapsuleDetail = () => {
  const { id } = useParams();
  const { data: capsule, isLoading } = useCapsule(id || "");
  const confettiFired = useRef(false);

  const isLocked = capsule ? new Date(capsule.unlock_date) > new Date() : false;

  useEffect(() => {
    if (capsule && !isLocked && !confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.4 },
        colors: ["#c8956c", "#d4a574", "#e8c9a0", "#f0dcc0"],
        gravity: 0.8,
      });
    }
  }, [capsule, isLocked]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-body text-muted-foreground animate-pulse">Opening the vault...</p>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl text-muted-foreground">Oops, that memory slipped away... 💨</p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4 font-body rounded-full">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const unlockDate = new Date(capsule.unlock_date);
  const diffMs = unlockDate.getTime() - Date.now();
  const daysUntilUnlock = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hoursUntilUnlock = Math.ceil(diffMs / (1000 * 60 * 60));
  const allMedia = capsule.capsule_photos ?? [];
  const photos = allMedia.filter((m) => (m as any).media_type === "image" || !(m as any).media_type);
  const videos = allMedia.filter((m) => (m as any).media_type === "video");
  const audios = allMedia.filter((m) => (m as any).media_type === "audio");
  const collaborators = capsule.capsule_collaborators ?? [];

  const formatCountdown = () => {
    if (daysUntilUnlock > 1) return `${daysUntilUnlock} days`;
    if (hoursUntilUnlock > 1) return `${hoursUntilUnlock} hours`;
    return "less than an hour";
  };

  return (
    <div className="container mx-auto max-w-2xl px-6 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to capsules
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Status badges */}
        <div className="flex items-center gap-2 mb-4">
          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium capsule-locked font-body">
              <Lock className="h-3 w-3" /> Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capsule-unlocked font-body">
              <Unlock className="h-3 w-3" /> Unlocked
            </span>
          )}
          {capsule.is_shared && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground font-body">
              <Users className="h-3 w-3" /> Shared
            </span>
          )}
        </div>

        <h1 className="font-display text-4xl font-bold text-foreground mb-3">{capsule.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-body mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Created {new Date(capsule.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {isLocked
              ? `Opens in ${formatCountdown()}`
              : `Opened ${unlockDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${unlockDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
          </span>
        </div>

        {isLocked ? (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="rounded-2xl bg-card p-10 text-center warm-glow">
            <Lock className="h-16 w-16 mx-auto mb-4 capsule-locked animate-float" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">This capsule is still sealed</h2>
            <p className="font-body text-muted-foreground mb-4">
              {daysUntilUnlock > 30 ? "Patience... some memories are worth waiting for." : daysUntilUnlock > 7 ? "Almost there! The anticipation makes it sweeter." : "So close! Just a little more..."}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-body">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{formatCountdown()}</span>
              <span className="text-muted-foreground">remaining</span>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Photos */}
            {photos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Image className="h-4 w-4 text-primary" />
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Photos</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={getPublicUrl(photo.storage_path)}
                      alt={photo.file_name}
                      className="rounded-xl w-full aspect-square object-cover sepia-overlay hover:filter-none transition-all duration-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Film className="h-4 w-4 text-primary" />
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Videos</p>
                </div>
                <div className="space-y-3">
                  {videos.map((v) => (
                    <video key={v.id} controls className="rounded-xl w-full" src={getPublicUrl(v.storage_path)} />
                  ))}
                </div>
              </div>
            )}

            {/* Audio */}
            {audios.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="h-4 w-4 text-primary" />
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Audio</p>
                </div>
                <div className="space-y-3">
                  {audios.map((a) => (
                    <div key={a.id} className="rounded-xl bg-muted p-4">
                      <p className="font-body text-xs text-muted-foreground mb-2">{a.file_name}</p>
                      <audio controls className="w-full" src={getPublicUrl(a.storage_path)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-card p-8">
              <p className="font-body text-foreground text-lg leading-relaxed mb-4">{capsule.description}</p>
              {capsule.notes && (
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-primary" />
                    <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Your notes</p>
                  </div>
                  <p className="font-display italic text-foreground leading-relaxed">"{capsule.notes}"</p>
                </div>
              )}
            </div>

            {capsule.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {capsule.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground font-body">#{tag}</span>
                ))}
              </div>
            )}

            {collaborators.length > 0 && (
              <div className="rounded-xl bg-muted p-4">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">Shared with</p>
                <div className="flex flex-wrap gap-2">
                  {collaborators.map((c) => (
                    <span key={c.id} className="rounded-full bg-card px-3 py-1 text-xs font-body text-foreground">{c.email}</span>
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
