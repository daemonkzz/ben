import { motion, Variants } from "framer-motion";
import { Puzzle, Zap, Key } from "lucide-react";
import portalSilhouette from "@/assets/portal-silhouette.png";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const WhatIsSection = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const cardHoverVariants: Variants = {
    hover: { 
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  };

  return (
    <section id="quests" className="py-24 md:py-32 relative overflow-hidden">
      <motion.div 
        ref={sectionRef}
        className="container mx-auto px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Section Title */}
        <motion.div className="mb-16" variants={itemVariants}>
          <h2 className="font-display text-[50px] md:text-[70px] lg:text-[90px] text-foreground leading-[0.9] tracking-tight italic">
            WHAT<br />
            IS <motion.span 
              className="text-primary text-glow"
              animate={isVisible ? {
                textShadow: [
                  "0 0 20px hsl(var(--primary) / 0.5)",
                  "0 0 40px hsl(var(--primary) / 0.8)",
                  "0 0 20px hsl(var(--primary) / 0.5)",
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              X PORTAL
            </motion.span>?
          </h2>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Description + Portal Image */}
          <motion.div className="lg:col-span-6 flex flex-col gap-4" variants={itemVariants}>
            <p className="text-foreground/40 text-[11px] leading-relaxed max-w-[250px] italic">
              An immersive puzzle-based quest that challenges your logic and perception
            </p>
            
            {/* Portal Image */}
            <motion.div 
              className="relative mt-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full max-w-[320px] aspect-[3/4] rounded-[40px] overflow-hidden bg-gradient-to-b from-primary/5 to-transparent relative">
                <motion.img 
                  src={portalSilhouette} 
                  alt="Portal" 
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={isVisible ? { scale: 1 } : {}}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                
                {/* Portal glow effect */}
                <motion.div 
                  className="absolute inset-0 pointer-events-none"
                  animate={isVisible ? {
                    boxShadow: [
                      "inset 0 0 60px hsl(var(--primary) / 0.1)",
                      "inset 0 0 100px hsl(var(--primary) / 0.2)",
                      "inset 0 0 60px hsl(var(--primary) / 0.1)",
                    ],
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Feature Cards */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Top Card - Highlighted with gradient */}
            <motion.div 
              className="bg-gradient-to-br from-primary/30 via-primary/10 to-card/80 rounded-[24px] p-6 border border-primary/20 cursor-pointer"
              variants={itemVariants}
              whileHover="hover"
            >
              <motion.div variants={cardHoverVariants}>
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Puzzle className="w-5 h-5 text-primary" />
                </motion.div>
                <p className="text-foreground/70 text-[11px] leading-relaxed italic">
                  You'll find yourself inside a mysterious space where logic is your main tool and intuition helps you survive. Everything here is not what it seems
                </p>
              </motion.div>
            </motion.div>

            {/* Bottom Row - Two cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card with yellow gradient */}
              <motion.div 
                className="bg-gradient-to-br from-primary/20 via-primary/5 to-card/80 rounded-[24px] p-5 border border-primary/10 cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-3"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Zap className="w-4 h-4 text-primary" />
                </motion.div>
                <p className="text-foreground/60 text-[10px] leading-relaxed italic">
                  You're not entering a game — you're entering a different universe. Portal X changes your perception from the first seconds
                </p>
              </motion.div>

              {/* Dark card */}
              <motion.div 
                className="bg-card/60 rounded-[24px] p-5 border border-border/20 cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Key className="w-4 h-4 text-primary" />
                </motion.div>
                <p className="text-foreground/50 text-[10px] leading-relaxed italic">
                  Every detail is key. Careful attention will determine whether you find a way out or remain part of the system forever.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default WhatIsSection;
