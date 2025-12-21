import heroBg from "@/assets/hero-bg.jpg";
import hourglassIcon from "@/assets/hourglass-icon.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden pb-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-16">
          {/* Left Content */}
          <div className="max-w-xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h1 className="font-display text-[100px] md:text-[140px] lg:text-[180px] text-foreground leading-[0.85] tracking-tight mb-8 italic">
              ESCAPE<br />ROOM
            </h1>
            <p className="text-foreground/40 text-[11px] max-w-[200px] leading-relaxed">
              Step into a world of puzzles, traps, and unexpected twists — an escape room that won't let you go until the very end
            </p>
          </div>

          {/* Right Content - Quest Card */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl p-4 inline-flex items-start gap-4 min-w-[180px]">
              <div className="flex-1">
                <div className="bg-primary text-primary-foreground text-[9px] font-medium px-2 py-0.5 rounded inline-block mb-2 uppercase tracking-wider">
                  New Quest
                </div>
                <h3 className="font-display text-xl text-foreground leading-tight tracking-wide">
                  THE LAST<br/>HOUR
                </h3>
                <span className="text-primary text-lg mt-1 inline-block">↗</span>
              </div>
              <div className="w-16 h-20 flex items-center justify-center">
                <img 
                  src={hourglassIcon} 
                  alt="Hourglass" 
                  className="w-14 h-14 object-contain animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large X on floor - positioned center bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="text-primary font-display text-[250px] md:text-[350px] leading-none opacity-30 text-glow">
          ✕
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
