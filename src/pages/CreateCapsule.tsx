import { useState } from "react";
import { useCapsules } from "@/context/CapsuleContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Lock, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CreateCapsule = () => {
  const { addCapsule, prompts } = useCapsules();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [sharedEmails, setSharedEmails] = useState("");
  const [tags, setTags] = useState("");

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !unlockDate) {
      toast.error("Oops, that memory slipped away—please add a title and unlock date!");
      return;
    }

    addCapsule({
      title,
      description,
      notes,
      unlockDate,
      isShared,
      sharedWith: isShared ? sharedEmails.split(",").map((e) => e.trim()).filter(Boolean) : [],
      photos: [],
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    toast.success("Your time capsule has been sealed! 🕰️");
    navigate("/dashboard");
  };

  return (
    <div className="container mx-auto max-w-2xl px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Create a Time Capsule
          </h1>
          <p className="font-body text-muted-foreground">
            Seal your memories away and let time bring them back to you.
          </p>
        </div>

        {/* Prompt suggestion */}
        <div className="mb-8 rounded-xl bg-card p-5 warm-glow">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Today's journaling prompt
              </p>
              <p className="font-display text-foreground italic">
                "{randomPrompt}"
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-body">Capsule Title</Label>
            <Input
              id="title"
              placeholder="Summer at the lake, Letter to future me..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-body">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this memory about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="font-body">Your Notes & Thoughts</Label>
            <Textarea
              id="notes"
              placeholder="Write freely... your future self will thank you."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unlockDate" className="font-body flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Unlock Date
            </Label>
            <Input
              id="unlockDate"
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="font-body">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="family, summer, love..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="font-body"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-card p-4">
            <div>
              <Label className="font-body font-medium">Share with others</Label>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Invite family & friends to view this capsule
              </p>
            </div>
            <Switch checked={isShared} onCheckedChange={setIsShared} />
          </div>

          {isShared && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <Label htmlFor="emails" className="font-body">Email Addresses</Label>
              <Input
                id="emails"
                placeholder="friend@email.com, family@email.com"
                value={sharedEmails}
                onChange={(e) => setSharedEmails(e.target.value)}
                className="font-body"
              />
            </motion.div>
          )}

          <Button type="submit" size="lg" className="w-full font-body rounded-full gap-2">
            <Send className="h-4 w-4" />
            Seal This Capsule
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCapsule;
