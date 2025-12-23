import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Application card types
type ApplicationStatus = "open" | "closed" | "approved" | "pending" | "draft";

interface ApplicationCardProps {
  title: string;
  status: ApplicationStatus;
  formId?: string;
  featured?: boolean;
  delay?: number;
}

interface HistoryItemProps {
  title: string;
  status: "approved" | "pending" | "draft" | "rejected";
  applicationNumber?: string;
  delay?: number;
}

// Floating particles generator
const generateFloatingParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 15 + Math.random() * 25,
    delay: Math.random() * 8
  }));
};

const ApplicationCard = ({ title, status, formId, featured, delay = 0 }: ApplicationCardProps) => {
  const getStatusContent = () => {
    switch (status) {
      case "open":
        return (
          <Link to={`/basvuru/${formId}`}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-md font-medium transition-all duration-300 border border-primary/20 hover:border-primary/40 text-sm tracking-wide text-center"
            >
              Başvuru Yap
            </motion.div>
          </Link>
        );
      case "closed":
        return (
          <div className="py-3 text-center text-muted-foreground/60 text-sm border border-border/20 rounded-md bg-muted/5">
            Başvurular şu an kapalı
          </div>
        );
      case "approved":
        return (
          <div className="py-3 text-center text-primary text-sm border border-primary/20 rounded-md bg-primary/5">
            Başvurunuz onaylandı
          </div>
        );
      case "pending":
        return (
          <div className="py-3 text-center text-amber-500 text-sm border border-amber-500/20 rounded-md bg-amber-500/5">
            Başvurunuz inceleniyor
          </div>
        );
      case "draft":
        return (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 rounded-md font-medium transition-all duration-300 border border-amber-500/20 text-sm"
          >
            Devam Et
          </motion.button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative p-5 rounded-lg border transition-all duration-300 group ${
        featured 
          ? "bg-card/60 border-primary/20 hover:border-primary/40" 
          : "bg-card/30 border-border/20 hover:border-border/40"
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors duration-300 tracking-wide">
            {title}
          </h3>
          {status === "approved" && (
            <span className="text-[10px] text-primary font-medium tracking-widest uppercase">
              Onaylı
            </span>
          )}
          {featured && status === "open" && (
            <span className="text-[10px] text-primary/60 font-medium tracking-widest uppercase">
              Açık
            </span>
          )}
        </div>

        {/* Subtle divider */}
        <div className="h-px bg-border/20" />

        {/* Status content */}
        {getStatusContent()}
      </div>
    </motion.div>
  );
};

const HistoryItem = ({ title, status, applicationNumber, delay = 0 }: HistoryItemProps) => {
  const statusConfig = {
    approved: { color: "text-primary", label: "Onaylandı" },
    pending: { color: "text-amber-500", label: "Beklemede" },
    draft: { color: "text-muted-foreground", label: "Taslak" },
    rejected: { color: "text-destructive", label: "Reddedildi" },
  };
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ x: -2 }}
      className="p-4 bg-card/20 border border-border/15 rounded-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h4>
          <span className={`text-xs ${config.color}`}>{config.label}</span>
        </div>
        {applicationNumber && (
          <span className="text-[10px] text-muted-foreground font-mono">
            #{applicationNumber}
          </span>
        )}
      </div>
      
      {status === "draft" && (
        <button className="mt-3 w-full py-2 text-xs bg-muted/30 hover:bg-muted/50 text-muted-foreground rounded-md border border-border/20 transition-all">
          Devam Et
        </button>
      )}
    </motion.div>
  );
};

const Basvuru = () => {
  const particles = useMemo(() => generateFloatingParticles(25), []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    },
  };

  // Example data
  const basicApplications: ApplicationCardProps[] = [
    { 
      title: "Whitelist Başvurusu", 
      status: "approved",
    },
  ];

  const roleApplications: ApplicationCardProps[] = [
    { title: "Birlik Başvurusu", status: "closed" },
    { title: "LSPD Akademi Başvurusu", status: "open", formId: "lspd-akademi", featured: true },
    { title: "Alt Karakter Başvurusu", status: "closed" },
    { title: "Şirket Başvurusu", status: "open", formId: "sirket", featured: true },
    { title: "Taksici Başvurusu", status: "open", formId: "taksici", featured: true },
    { title: "LSFMD Hastane Birimi Başvurusu", status: "open", formId: "hastane", featured: true },
  ];

  const applicationHistory: HistoryItemProps[] = [
    { title: "Şirket Başvurusu", status: "draft", applicationNumber: "2178" },
    { title: "Whitelist Başvuru", status: "approved", applicationNumber: "1139" },
    { title: "Ön Onay", status: "approved", applicationNumber: "576" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-primary/30"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Hero gradient background */}
      <div className="fixed inset-0 hero-gradient pointer-events-none z-[0]" />
      
      {/* Animated light rays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        <motion.div 
          className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-primary/15 via-primary/5 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3], x: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-0 right-1/3 w-[1px] h-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
          animate={{ opacity: [0.2, 0.5, 0.2], x: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div 
          className="absolute top-0 left-2/3 w-[1px] h-full bg-gradient-to-b from-primary/8 via-transparent to-transparent"
          animate={{ opacity: [0.15, 0.4, 0.15], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Large ambient glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-[0]" />

      <Header />
      
      <main className="flex-1 pt-32 pb-24 relative z-10">
        <motion.div 
          className="container mx-auto px-4 md:px-6 max-w-7xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-10">
            <Link 
              to="/"
              className="inline-flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <motion.div
                whileHover={{ x: -4 }}
                className="p-2 rounded-lg bg-card/50 border border-border/30 group-hover:border-primary/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.div>
              <span className="text-sm tracking-wide">Ana Sayfa</span>
            </Link>
          </motion.div>

          {/* Page Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <span className="text-primary/60 text-xs tracking-[0.4em] uppercase font-medium mb-5 block">
              Yönetim Paneli
            </span>
            
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.9] tracking-tight">
              <motion.span 
                className="text-primary inline-block"
                animate={{
                  textShadow: [
                    "0 0 20px hsl(var(--primary) / 0.3)",
                    "0 0 50px hsl(var(--primary) / 0.6)",
                    "0 0 20px hsl(var(--primary) / 0.3)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                BAŞVURU
              </motion.span>
              {" "}
              <span className="text-foreground/40">MERKEZİ</span>
            </h1>
            
            <motion.div 
              className="w-40 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-8 mb-6"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            
            <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
              Sunucuya katılım ve rol yetkileri için gerekli tüm başvurularını buradan yönetebilirsin.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-8 lg:gap-12">
            {/* Left Column - Applications */}
            <div className="space-y-14">
              {/* Basic Applications Section */}
              <motion.section variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                  <h2 className="font-display text-base tracking-[0.25em] text-primary/90 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    TEMEL BAŞVURULAR
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </div>

                <div className="max-w-lg">
                  {basicApplications.map((app, index) => (
                    <ApplicationCard key={index} {...app} delay={0.1} />
                  ))}
                </div>
              </motion.section>

              {/* Role Applications Section */}
              <motion.section variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                  <h2 className="font-display text-base tracking-[0.25em] text-primary/90 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ROL BAŞVURULARI
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleApplications.map((app, index) => (
                    <ApplicationCard key={index} {...app} delay={0.15 + index * 0.08} />
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Right Column - Sidebar */}
            <motion.aside
              variants={itemVariants}
              className="lg:sticky lg:top-32 self-start"
            >
              <div className="relative p-6 rounded-2xl bg-card/20 backdrop-blur-sm border border-border/20 overflow-hidden">
                {/* Background glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 space-y-5">
                  {/* Section title */}
                  <div className="pb-4 border-b border-border/20">
                    <h2 className="font-display text-sm tracking-[0.2em] text-primary/80">
                      GEÇMİŞ BAŞVURULARIN
                    </h2>
                  </div>

                  {/* History items */}
                  <div className="space-y-3">
                    {applicationHistory.map((item, index) => (
                      <HistoryItem key={index} {...item} delay={0.5 + index * 0.1} />
                    ))}
                  </div>

                  {/* Footer decoration */}
                  <div className="pt-5 mt-5 border-t border-border/10">
                    <motion.div 
                      className="flex items-center gap-2.5 text-muted-foreground/40 text-xs"
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary/40" />
                      <span className="tracking-wide">Aktif başvuru sistemi</span>
                    </motion.div>
                  </div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary/40 to-transparent" />
                  <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-primary/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8">
                  <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-primary/40 to-transparent" />
                  <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-primary/40 to-transparent" />
                </div>
              </div>
            </motion.aside>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Basvuru;
