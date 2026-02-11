import { useState, useRef } from "react";
import { useCreateCapsule } from "@/hooks/useCapsules";
import { useAIPrompts, fallbackPrompts } from "@/hooks/useAIPrompts";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock, Send, Sparkles, ImagePlus, X, Film, Mic } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const CreateCapsule = () => {
  const createCapsule = useCreateCapsule();
  const navigate = useNavigate();
  const { data: prompts = fallbackPrompts } = useAIPrompts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("09:00");
  const [isShared, setIsShared] = useState(false);
  const [sharedEmails, setSharedEmails] = useState("");
  const [tags, setTags] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  const getMediaType = (file: File): "image" | "video" | "audio" => {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "image";
  };

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE);
    if (valid.length < files.length) {
      toast.error("Some files were too large (max 20MB each)");
    }
    setMediaFiles((prev) => [...prev, ...valid].slice(0, 10));
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !unlockDate) {
      toast.error("Please add a title and unlock date!");
      return;
    }

    const unlockDateTime = `${unlockDate}T${unlockTime}:00`;

    try {
      await createCapsule.mutateAsync({
        title,
        description,
        notes,
        unlock_date: unlockDateTime,
        is_shared: isShared,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        shared_emails: isShared ? sharedEmails.split(",").map((e) => e.trim()).filter(Boolean) : [],
        media_files: mediaFiles,
      });
      toast.success("Your time capsule has been sealed! 🕰️");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const renderPreview = (file: File, i: number) => {
    const type = getMediaType(file);
    return (
      <div key={i} className="relative group">
        {type === "image" && (
          <img src={URL.createObjectURL(file)} alt={file.name} className="h-20 w-20 rounded-lg object-cover" />
        )}
        {type === "video" && (
          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
            <Film className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        {type === "audio" && (
          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
            <Mic className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <button
          type="button"
          onClick={() => removeMedia(i)}
          className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
        <p className="text-[9px] text-muted-foreground truncate w-20 mt-1">{file.name}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-2xl px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Create a Time Capsule</h1>
          <p className="font-body text-muted-foreground">Seal your memories away and let time bring them back to you.</p>
        </div>

        {/* AI Prompt */}
        <div className="mb-8 rounded-xl bg-card p-5 warm-glow">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">AI journaling prompt</p>
              <p className="font-display text-foreground italic">"{randomPrompt}"</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-body">Capsule Title</Label>
            <Input id="title" placeholder="Summer at the lake, Letter to future me..." value={title} onChange={(e) => setTitle(e.target.value)} className="font-body" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-body">Description</Label>
            <Textarea id="description" placeholder="What's this memory about?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="font-body" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="font-body">Your Notes & Thoughts</Label>
            <Textarea id="notes" placeholder="Write freely... your future self will thank you." value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} className="font-body" />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label className="font-body">Photos, Videos & Audio</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              onChange={handleMedia}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
              <span className="font-body text-sm text-muted-foreground">
                Click to add photos, videos, or audio (max 20MB each, up to 10)
              </span>
            </div>
            {mediaFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {mediaFiles.map((file, i) => renderPreview(file, i))}
              </div>
            )}
          </div>

          {/* Unlock Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unlockDate" className="font-body flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Unlock Date
              </Label>
              <Input id="unlockDate" type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="font-body" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unlockTime" className="font-body">Unlock Time</Label>
              <Input id="unlockTime" type="time" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} className="font-body" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="font-body">Tags (comma separated)</Label>
            <Input id="tags" placeholder="family, summer, love..." value={tags} onChange={(e) => setTags(e.target.value)} className="font-body" />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-card p-4">
            <div>
              <Label className="font-body font-medium">Share with others</Label>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Invite family & friends — they'll get an email when it unlocks
              </p>
            </div>
            <Switch checked={isShared} onCheckedChange={setIsShared} />
          </div>

          {isShared && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
              <Label htmlFor="emails" className="font-body">Email Addresses</Label>
              <Input id="emails" placeholder="friend@email.com, family@email.com" value={sharedEmails} onChange={(e) => setSharedEmails(e.target.value)} className="font-body" />
            </motion.div>
          )}

          <Button type="submit" size="lg" className="w-full font-body rounded-full gap-2" disabled={createCapsule.isPending}>
            <Send className="h-4 w-4" />
            {createCapsule.isPending ? "Sealing..." : "Seal This Capsule"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCapsule;
