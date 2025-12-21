import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import hourglassIcon from "@/assets/hourglass-icon.png";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-end overflow-hidden pb-8">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          y: backgroundY,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="container mx-auto px-6 relative z-10"
        style={{ opacity }}
      >
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-16">
          {/* Left Content */}
          <motion.div 
            className="max-w-xl"
            style={{ y: textY }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <motion.h1 
              className="font-display text-[100px] md:text-[140px] lg:text-[180px] text-foreground leading-[0.85] tracking-tight mb-8 italic"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.span
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                ESCAPE
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                ROOM
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-foreground/40 text-[11px] max-w-[200px] leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              Step into a world of puzzles, traps, and unexpected twists — an escape room that won't let you go until the very end
            </motion.p>
          </motion.div>

          {/* Right Content - Quest Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <motion.div 
              className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl p-4 inline-flex items-start gap-4 min-w-[180px]"
              whileHover={{ 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                borderColor: "hsl(var(--primary) / 0.3)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1">
                <motion.div 
                  className="bg-primary text-primary-foreground text-[9px] font-medium px-2 py-0.5 rounded inline-block mb-2 uppercase tracking-wider"
                  animate={{ 
                    boxShadow: [
                      "0 0 0px hsl(var(--primary) / 0)",
                      "0 0 15px hsl(var(--primary) / 0.5)",
                      "0 0 0px hsl(var(--primary) / 0)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  New Quest
                </motion.div>
                <h3 className="font-display text-xl text-foreground leading-tight tracking-wide">
                  THE LAST<br/>HOUR
                </h3>
                <motion.span 
                  className="text-primary text-lg mt-1 inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ↗
                </motion.span>
              </div>
              <div className="w-16 h-20 flex items-center justify-center">
                <motion.img 
                  src={hourglassIcon} 
                  alt="Hourglass" 
                  className="w-14 h-14 object-contain"
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Large X on floor - positioned center bottom */}
      <motion.div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <motion.div 
          className="text-primary font-display text-[250px] md:text-[350px] leading-none text-glow"
          animate={{ 
            opacity: [0.2, 0.35, 0.2],
            textShadow: [
              "0 0 30px hsl(var(--primary) / 0.3)",
              "0 0 60px hsl(var(--primary) / 0.5)",
              "0 0 30px hsl(var(--primary) / 0.3)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          ✕
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
