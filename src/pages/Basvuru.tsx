import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock, Check, ArrowLeft, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ApplicationStatus = "open" | "closed" | "approved" | "pending" | "draft";

interface ApplicationCardProps {
  title: string;
  status: ApplicationStatus;
  featured?: boolean;
  delay?: number;
}

interface HistoryItemProps {
  title: string;
  status: "approved" | "pending" | "draft" | "rejected";
  applicationNumber?: string;
  delay?: number;
}

const generateFloatingParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 20 + Math.random() * 30,
    delay: Math.random() * 10
  }));
};

const ApplicationCard = ({ title, status, featured, delay = 0 }: ApplicationCardProps) => {
  const getStatusContent = () => {
    switch (status) {
      case "open":
        return (
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="text-sm text-foreground/70 hover:text-primary transition-colors duration-300 flex items-center gap-2 group/btn"
          >
            <span className="border-b border-transparent group-hover/btn:border-primary transition-colors">Başvuru Yap</span>
            <span className="text-primary opacity-0 group-hover/btn:opacity-100 transition-opacity">→</span>
          </motion.button>
        );
      case "closed":
        return (
          <div className="flex items-center gap-2 text-foreground/30">
            <Lock className="w-3 h-3" />
            <span className="text-xs tracking-wide">Başvurular kapalı</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center gap-2 text-primary">
            <Check className="w-3 h-3" />
            <span className="text-xs tracking-wide">Onaylandı</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 text-amber-500/70">
            <Clock className="w-3 h-3" />
            <span className="text-xs tracking-wide">İnceleniyor</span>
          </div>
        );
      case "draft":
        return (
          <motion.button
            whileHover={{ x: 4 }}
            className="text-sm text-amber-500/70 hover:text-amber-500 transition-colors flex items-center gap-2"
          >
            <span>Devam Et</span>
            <span>→</span>
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
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative py-6 border-b border-border/10 hover:border-primary/20 transition-colors duration-500 ${
        featured ? "bg-gradient-to-r from-primary/[0.02] to-transparent -mx-4 px-4" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg tracking-wide text-foreground/90 group-hover:text-foreground transition-colors">
              {title}
            </h3>
            {featured && (
              <span className="text-[9px] tracking-[0.2em] text-primary/60 uppercase">new</span>
            )}
          </div>
          {getStatusContent()}
        </div>
        
        {status === "approved" && (
          <span className="text-[10px] tracking-[0.15em] text-primary/50 uppercase mt-1">
            onaylı
          </span>
        )}
      </div>
      
      {/* Subtle left accent on hover */}
      <motion.div 
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 bg-primary/50 group-hover:h-8 transition-all duration-300"
      />
    </motion.div>
  );
};

const HistoryItem = ({ title, status, applicationNumber, delay = 0 }: HistoryItemProps) => {
  const statusColors = {
    approved: "text-primary",
    pending: "text-amber-500/70",
    draft: "text-foreground/40",
    rejected: "text-destructive/70",
  };

  const statusLabels = {
    approved: "Onaylandı",
    pending: "Beklemede",
    draft: "Taslak",
    rejected: "Reddedildi",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="group py-3 border-b border-border/5 last:border-0 hover:bg-primary/[0.02] -mx-2 px-2 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors truncate">
            {title}
          </p>
          <p className={`text-[10px] tracking-wide mt-0.5 ${statusColors[status]}`}>
            {statusLabels[status]}
          </p>
        </div>
        {applicationNumber && (
          <span className="text-[10px] text-foreground/20 font-mono">
            {applicationNumber}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const Basvuru = () => {
  const particles = useMemo(() => generateFloatingParticles(15), []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const basicApplications: ApplicationCardProps[] = [
    { title: "Whitelist Başvurusu", status: "approved" },
  ];

  const roleApplications: ApplicationCardProps[] = [
    { title: "Birlik Başvurusu", status: "closed" },
    { title: "LSPD Akademi Başvurusu", status: "open", featured: true },
    { title: "Alt Karakter Başvurusu", status: "closed" },
    { title: "Şirket Başvurusu", status: "open", featured: true },
    { title: "Taksici Başvurusu", status: "open", featured: true },
    { title: "LSFMD Hastane Birimi Başvurusu", status: "open", featured: true },
  ];

  const applicationHistory: HistoryItemProps[] = [
    { title: "Şirket Başvurusu", status: "draft", applicationNumber: "2178" },
    { title: "Whitelist Başvuru", status: "approved", applicationNumber: "1139" },
    { title: "Ön Onay", status: "approved", applicationNumber: "576" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Minimal floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 0.4, 0],
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

      {/* Subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none z-[0]" />

      <Header />
      
      <main className="flex-1 pt-28 md:pt-36 pb-24 relative z-10">
        <motion.div 
          className="container mx-auto px-6 max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back */}
          <motion.div variants={itemVariants} className="mb-16">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-foreground/40 hover:text-foreground/70 transition-colors text-sm"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Geri</span>
            </Link>
          </motion.div>

          {/* Header - Left aligned, minimal */}
          <motion.header variants={itemVariants} className="mb-20 max-w-2xl">
            <p className="text-primary/60 text-xs tracking-[0.3em] uppercase mb-4">
              Başvuru Merkezi
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
              Tüm başvurularını
              <br />
              <span className="text-foreground/30">tek yerden yönet.</span>
            </h1>
            <p className="text-foreground/40 text-sm leading-relaxed max-w-md">
              Sunucuya katılım ve rol yetkileri için gerekli başvurular
            </p>
          </motion.header>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16 lg:gap-24">
            {/* Left - Applications */}
            <div className="space-y-16">
              {/* Basic Applications */}
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-[11px] tracking-[0.25em] text-foreground/30 uppercase">
                    Temel
                  </h2>
                  <div className="flex-1 h-px bg-border/10" />
                </div>
                
                <div>
                  {basicApplications.map((app, index) => (
                    <ApplicationCard key={index} {...app} delay={0.1 + index * 0.05} />
                  ))}
                </div>
              </motion.section>

              {/* Role Applications */}
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-[11px] tracking-[0.25em] text-foreground/30 uppercase">
                    Rol Başvuruları
                  </h2>
                  <div className="flex-1 h-px bg-border/10" />
                </div>
                
                <div>
                  {roleApplications.map((app, index) => (
                    <ApplicationCard key={index} {...app} delay={0.15 + index * 0.05} />
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Right - Sidebar */}
            <motion.aside variants={itemVariants} className="lg:pt-8">
              <div className="lg:sticky lg:top-32">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-[11px] tracking-[0.25em] text-foreground/30 uppercase">
                    Geçmiş
                  </h2>
                  <div className="flex-1 h-px bg-border/10" />
                </div>

                <div className="space-y-0">
                  {applicationHistory.map((item, index) => (
                    <HistoryItem key={index} {...item} delay={0.4 + index * 0.08} />
                  ))}
                </div>

                {/* Minimal footer note */}
                <div className="mt-8 pt-6 border-t border-border/5">
                  <p className="text-[10px] text-foreground/20 tracking-wide">
                    Sistem aktif
                  </p>
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
