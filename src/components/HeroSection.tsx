import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import hourglassIcon from "@/assets/hourglass-icon.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden pb-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          {/* Left Content */}
          <div className="max-w-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="font-display text-[80px] md:text-[120px] lg:text-[140px] text-foreground leading-[0.85] tracking-tight mb-6">
              ESCAPE<br />ROOM
            </h1>
            <p className="text-foreground/50 text-xs md:text-sm max-w-xs mb-6 leading-relaxed">
              Step into a world of mystery and adventure. 
              Solve puzzles, unlock secrets, and escape before 
              time runs out. Are you ready?
            </p>
          </div>

          {/* Right Content - Quest Card */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="bg-card/60 backdrop-blur-md border border-border/30 rounded-2xl p-3 inline-flex items-center gap-3">
              <div>
                <div className="text-[10px] text-foreground/40 uppercase tracking-wider mb-0.5">Active Game</div>
                <h3 className="font-display text-lg text-foreground leading-tight">THE LAST<br/>HOUR</h3>
              </div>
              <div className="w-16 h-20 rounded-xl overflow-hidden bg-card flex items-center justify-center">
                <img 
                  src={hourglassIcon} 
                  alt="Hourglass" 
                  className="w-12 h-12 object-contain animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large X on floor - positioned center bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="text-primary font-display text-[300px] md:text-[400px] leading-none opacity-20 text-glow">
          ✕
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
