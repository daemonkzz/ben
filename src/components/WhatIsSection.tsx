import { Puzzle, Zap, Key } from "lucide-react";
import portalSilhouette from "@/assets/portal-silhouette.png";

const WhatIsSection = () => {
  return (
    <section id="quests" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="mb-16 animate-fade-in-up">
          <h2 className="font-display text-[50px] md:text-[70px] lg:text-[90px] text-foreground leading-[0.9] tracking-tight italic">
            WHAT<br />
            IS <span className="text-primary text-glow">X PORTAL</span>?
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Description + Portal Image */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <p className="text-foreground/40 text-[11px] leading-relaxed max-w-[250px] italic">
              An immersive puzzle-based quest that challenges your logic and perception
            </p>
            
            {/* Portal Image */}
            <div className="relative mt-4">
              <div className="w-full max-w-[320px] aspect-[3/4] rounded-[40px] overflow-hidden bg-gradient-to-b from-primary/5 to-transparent relative">
                <img 
                  src={portalSilhouette} 
                  alt="Portal" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* Right - Feature Cards */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Top Card - Highlighted with gradient */}
            <div className="bg-gradient-to-br from-primary/30 via-primary/10 to-card/80 rounded-[24px] p-6 border border-primary/20">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Puzzle className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground/70 text-[11px] leading-relaxed italic">
                You'll find yourself inside a mysterious space where logic is your main tool and intuition helps you survive. Everything here is not what it seems
              </p>
            </div>

            {/* Bottom Row - Two cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card with yellow gradient */}
              <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-card/80 rounded-[24px] p-5 border border-primary/10">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <p className="text-foreground/60 text-[10px] leading-relaxed italic">
                  You're not entering a game — you're entering a different universe. Portal X changes your perception from the first seconds
                </p>
              </div>

              {/* Dark card */}
              <div className="bg-card/60 rounded-[24px] p-5 border border-border/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <p className="text-foreground/50 text-[10px] leading-relaxed italic">
                  Every detail is key. Careful attention will determine whether you find a way out or remain part of the system forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;
