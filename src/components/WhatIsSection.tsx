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

  return (
    <section id="quests" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background gradient - smooth fade */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.03) 30%, hsl(var(--primary) / 0.08) 60%, hsl(var(--primary) / 0.04) 85%, transparent 100%)",
        }}
      />
      
      <motion.div 
        ref={sectionRef}
        className="container mx-auto px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Section Title - Matching reference size */}
        <motion.div className="mb-16 md:mb-20" variants={itemVariants}>
          <h2 className="font-display text-[48px] md:text-[64px] lg:text-[80px] text-foreground leading-[0.95] tracking-tight italic uppercase">
            WHAT<br />
            IS <motion.span 
              className="text-primary"
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

        {/* Content Grid - Reference layout */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column - Description + Portal Image */}
          <motion.div className="lg:col-span-5 flex flex-col" variants={itemVariants}>
            {/* Description text - small italic, positioned above portal */}
            <p className="text-foreground/40 text-[11px] md:text-xs leading-relaxed max-w-[220px] mb-4 italic font-light">
              An immersive puzzle-based quest that challenges your logic and perception
            </p>
            
            {/* Portal Image container */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-full max-w-[400px] aspect-[3/4] relative">
                {/* Portal glow behind */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse 50% 60% at 50% 50%, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.5) 30%, hsl(var(--primary) / 0.2) 50%, transparent 70%)",
                    filter: "blur(50px)",
                    transform: "translateY(5%)",
                  }}
                  animate={isVisible ? {
                    opacity: [0.7, 1, 0.7],
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Silhouette image */}
                <motion.img 
                  src={portalSilhouette} 
                  alt="Portal silhouette" 
                  className="relative z-10 w-full h-full object-contain"
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={isVisible ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                
                {/* Floor reflection/glow */}
                <motion.div 
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[280px] h-[80px]"
                  style={{
                    background: "radial-gradient(ellipse 100% 100% at 50% 0%, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.4) 40%, transparent 70%)",
                    filter: "blur(20px)",
                  }}
                  animate={isVisible ? {
                    opacity: [0.6, 0.9, 0.6],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Feature Cards (asymmetric grid matching reference) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Top Card - positioned to the right, taller */}
            <motion.div 
              className="relative bg-[#1a1a1a]/80 rounded-2xl p-6 border border-white/5 cursor-pointer overflow-hidden ml-auto w-full max-w-[340px]"
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              style={{ minHeight: "160px" }}
            >
              <motion.div 
                className="w-8 h-8 flex items-center justify-center mb-4"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Puzzle className="w-6 h-6 text-primary" />
              </motion.div>
              <p className="text-foreground/60 text-[11px] md:text-xs leading-relaxed">
                You'll find yourself inside a mysterious space where logic is your main tool and intuition helps you survive. Everything here is not what it seems
              </p>
            </motion.div>

            {/* Bottom Row - Two cards side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card with gradient overlay */}
              <motion.div 
                className="relative bg-[#1a1a1a]/80 rounded-2xl p-5 border border-white/5 cursor-pointer overflow-hidden"
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                style={{ minHeight: "140px" }}
              >
                {/* Diagonal yellow gradient overlay - subtle */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, transparent 20%, hsl(var(--primary) / 0.08) 50%, hsl(var(--primary) / 0.15) 80%, hsl(var(--primary) / 0.25) 100%)",
                  }}
                />
                
                <motion.div 
                  className="w-7 h-7 flex items-center justify-center mb-3 relative z-10"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Zap className="w-5 h-5 text-primary" />
                </motion.div>
                <p className="text-foreground/50 text-[10px] md:text-[11px] leading-relaxed relative z-10">
                  You're not entering a game — you're entering a different universe. Portal X changes your perception from the first seconds
                </p>
              </motion.div>

              {/* Dark card - no gradient */}
              <motion.div 
                className="bg-[#1a1a1a]/80 rounded-2xl p-5 border border-white/5 cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                style={{ minHeight: "140px" }}
              >
                <motion.div 
                  className="w-7 h-7 flex items-center justify-center mb-3"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Key className="w-5 h-5 text-primary" />
                </motion.div>
                <p className="text-foreground/50 text-[10px] md:text-[11px] leading-relaxed">
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

