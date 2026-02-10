import { useAIPrompts, fallbackPrompts } from "@/hooks/useAIPrompts";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const Prompts = () => {
  const { user } = useAuth();
  const { data: prompts = fallbackPrompts, isLoading, isFetching } = useAIPrompts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryClient = useQueryClient();

  const shuffle = () => {
    setCurrentIndex((prev) => (prev + 1) % prompts.length);
  };

  const regenerate = () => {
    queryClient.invalidateQueries({ queryKey: ["ai-prompts", user?.id] });
    setCurrentIndex(0);
  };

  return (
    <div className="container mx-auto max-w-2xl px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">
          Journaling Prompts
        </h1>
        <p className="font-body text-muted-foreground mb-10">
          AI-crafted questions inspired by your memories to guide you down memory lane.
        </p>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-card p-10 warm-glow text-center mb-8"
        >
          <Sparkles className="h-8 w-8 mx-auto mb-4 text-primary" />
          {isLoading || isFetching ? (
            <p className="font-display text-xl text-muted-foreground animate-pulse">
              Crafting prompts from your memories...
            </p>
          ) : (
            <p className="font-display text-2xl md:text-3xl italic text-foreground leading-relaxed">
              "{prompts[currentIndex]}"
            </p>
          )}
        </motion.div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={shuffle} className="font-body rounded-full gap-2" disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
            Next prompt
          </Button>
          <Button variant="outline" onClick={regenerate} className="font-body rounded-full gap-2" disabled={isFetching}>
            <Sparkles className="h-4 w-4" />
            Generate new set
          </Button>
        </div>

        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">All Prompts</h2>
          <div className="space-y-3">
            {prompts.map((prompt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl p-4 font-body text-sm cursor-pointer transition-colors ${
                  i === currentIndex ? "bg-primary/10 text-foreground" : "bg-card text-foreground hover:bg-secondary"
                }`}
                onClick={() => setCurrentIndex(i)}
              >
                <span className="text-primary mr-2 font-semibold">{i + 1}.</span>
                {prompt}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Prompts;
