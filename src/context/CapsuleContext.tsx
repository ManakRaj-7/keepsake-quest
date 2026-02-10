import { createContext, useContext, useState, ReactNode } from "react";

export interface Capsule {
  id: string;
  title: string;
  description: string;
  notes: string;
  unlockDate: string;
  createdAt: string;
  isLocked: boolean;
  isShared: boolean;
  sharedWith: string[];
  photos: string[];
  tags: string[];
}

interface CapsuleContextType {
  capsules: Capsule[];
  addCapsule: (capsule: Omit<Capsule, "id" | "createdAt" | "isLocked">) => void;
  getCapsule: (id: string) => Capsule | undefined;
  prompts: string[];
}

const journalPrompts = [
  "What's a sound from your childhood that instantly brings back memories?",
  "Describe a meal that someone special once made for you.",
  "What's a place you've visited that changed how you see the world?",
  "Write about a moment when a stranger showed you unexpected kindness.",
  "What song takes you back to a specific time in your life?",
  "Describe the view from a window you used to look out of often.",
  "What's something you learned from a grandparent or elder?",
  "Write about a rainy day that turned into something wonderful.",
];

const mockCapsules: Capsule[] = [
  {
    id: "1",
    title: "Summer at Grandma's House",
    description: "The golden afternoons we spent in her garden, the smell of fresh lemonade, and stories under the old oak tree.",
    notes: "I remember the way sunlight filtered through the leaves...",
    unlockDate: "2024-06-15",
    createdAt: "2024-01-10",
    isLocked: false,
    isShared: false,
    sharedWith: [],
    photos: [],
    tags: ["family", "summer", "childhood"],
  },
  {
    id: "2",
    title: "Our First Road Trip",
    description: "Three friends, one old car, and 2,000 miles of unforgettable memories.",
    notes: "We got lost somewhere in New Mexico and found the best diner...",
    unlockDate: "2024-12-25",
    createdAt: "2024-03-20",
    isLocked: false,
    isShared: true,
    sharedWith: ["alex@email.com", "sam@email.com"],
    photos: [],
    tags: ["friends", "adventure", "travel"],
  },
  {
    id: "3",
    title: "Letter to Future Me",
    description: "A message I wrote to myself, to be opened on my 30th birthday.",
    notes: "Dear future me, I hope you still remember to dance in the rain...",
    unlockDate: "2026-08-15",
    createdAt: "2024-08-15",
    isLocked: true,
    isShared: false,
    sharedWith: [],
    photos: [],
    tags: ["personal", "reflection"],
  },
  {
    id: "4",
    title: "Anniversary Surprise for Mom & Dad",
    description: "A collection of family memories for their 35th anniversary.",
    notes: "Collected messages from all the siblings and cousins...",
    unlockDate: "2026-05-20",
    createdAt: "2025-01-05",
    isLocked: true,
    isShared: true,
    sharedWith: ["sister@email.com", "brother@email.com"],
    photos: [],
    tags: ["family", "anniversary", "surprise"],
  },
];

const CapsuleContext = createContext<CapsuleContextType | undefined>(undefined);

export function CapsuleProvider({ children }: { children: ReactNode }) {
  const [capsules, setCapsules] = useState<Capsule[]>(mockCapsules);

  const addCapsule = (capsule: Omit<Capsule, "id" | "createdAt" | "isLocked">) => {
    const newCapsule: Capsule = {
      ...capsule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      isLocked: new Date(capsule.unlockDate) > new Date(),
    };
    setCapsules((prev) => [newCapsule, ...prev]);
  };

  const getCapsule = (id: string) => capsules.find((c) => c.id === id);

  return (
    <CapsuleContext.Provider value={{ capsules, addCapsule, getCapsule, prompts: journalPrompts }}>
      {children}
    </CapsuleContext.Provider>
  );
}

export function useCapsules() {
  const context = useContext(CapsuleContext);
  if (!context) throw new Error("useCapsules must be used within CapsuleProvider");
  return context;
}
