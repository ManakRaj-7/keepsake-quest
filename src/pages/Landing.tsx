import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover sepia-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>

        <div className="relative container mx-auto px-6 pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-foreground mb-6">
              Preserve your{" "}
              <span className="text-gradient-warm italic">precious</span>{" "}
              memories
            </h1>
            <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Create time capsules filled with photos, notes, and voice memos. 
              Lock them away and rediscover the magic when they unlock.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/create">
                <Button size="lg" className="font-body text-base gap-2 rounded-full px-8">
                  Create a Capsule
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-body text-base rounded-full px-8"
                >
                  View My Memories
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your memories deserve more
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-md mx-auto">
            Not just storage—emotional preservation and surprise rediscovery.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Clock,
              title: "Time Capsules",
              desc: "Lock memories to unlock on a future date. Like a message in a bottle, but digital.",
            },
            {
              icon: Users,
              title: "Shared Moments",
              desc: "Invite family & friends to contribute. Build surprise capsules together for special occasions.",
            },
            {
              icon: Heart,
              title: "Memory Flashbacks",
              desc: "Receive gentle reminders of past memories. Rediscover moments you'd almost forgotten.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center p-6"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-card warm-glow p-12 text-center"
        >
          <p className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-3">
            Start preserving today
          </p>
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            Every memory is worth keeping
          </h2>
          <Link to="/create">
            <Button size="lg" className="font-body rounded-full px-10 gap-2">
              Create Your First Capsule
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm text-muted-foreground">
            🕰️ Memory Lane Journal — preserving what matters most
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
