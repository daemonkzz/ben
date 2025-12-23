import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Map, BookOpen, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const storyContent = [
  {
    id: "giris",
    title: "GİRİŞ",
    content: `Buraya hikayenin giriş bölümü gelecek. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
  },
  {
    id: "bolum-1",
    title: "BÖLÜM 1: BAŞLANGIÇ",
    content: `Buraya birinci bölüm gelecek. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`
  },
  {
    id: "bolum-2",
    title: "BÖLÜM 2: YOLCULUK",
    content: `Buraya ikinci bölüm gelecek. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.`
  },
  {
    id: "bolum-3",
    title: "BÖLÜM 3: KEŞİF",
    content: `Buraya üçüncü bölüm gelecek. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`
  },
  {
    id: "son",
    title: "SON",
    content: `Buraya hikayenin son bölümü gelecek. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`
  }
];

const Hikaye = () => {
  const [activeTab, setActiveTab] = useState<"whimsical" | "hikaye">("whimsical");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("giris");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== "hikaye") return;

    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);

      const sections = element.querySelectorAll("[data-section]");
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        if (rect.top <= elementRect.top + 150) {
          setActiveSection(section.getAttribute("data-section") || "giris");
        }
      });
    };

    const element = contentRef.current;
    element?.addEventListener("scroll", handleScroll);
    return () => element?.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero gradient background */}
      <div className="fixed inset-0 hero-gradient pointer-events-none" />
      
      <Header />
      
      {/* Progress Bar */}
      {activeTab === "hikaye" && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-secondary z-50">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${scrollProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      <main className="flex-1 pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm tracking-[0.3em] uppercase mb-4 block">
              Keşfet
            </span>
            <h1 className="text-5xl md:text-7xl font-display text-foreground mb-4 tracking-wide">
              HİKAYE & EVREN
            </h1>
            <div className="w-24 h-0.5 bg-primary mx-auto mb-6" />
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Sunucumuzun derin hikayesini ve evrenini keşfedin
            </p>
          </motion.div>

          {/* Tab Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center items-center gap-4 mb-12"
          >
            {/* Whimsical Info */}
            <AnimatePresence>
              {activeTab === "whimsical" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="w-8 h-8 rounded-full border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs bg-card border border-border p-3">
                      <p className="text-xs text-foreground">
                        Whimsical bilgi metni buraya gelecek.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Whimsical Button */}
            <motion.button
              onClick={() => setActiveTab("whimsical")}
              className={`relative flex items-center gap-2 px-6 py-2.5 font-display text-sm tracking-wider transition-all duration-300 ${
                activeTab === "whimsical"
                  ? "bg-primary text-primary-foreground box-glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Map className="w-4 h-4" />
              WHIMSICAL
            </motion.button>

            <div className="w-px h-6 bg-border" />

            {/* Hikaye Button */}
            <motion.button
              onClick={() => setActiveTab("hikaye")}
              className={`relative flex items-center gap-2 px-6 py-2.5 font-display text-sm tracking-wider transition-all duration-300 ${
                activeTab === "hikaye"
                  ? "bg-primary text-primary-foreground box-glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="w-4 h-4" />
              HİKAYE
            </motion.button>

            {/* Hikaye Info */}
            <AnimatePresence>
              {activeTab === "hikaye" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="w-8 h-8 rounded-full border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs bg-card border border-border p-3">
                      <p className="text-xs text-foreground">
                        Hikaye bilgi metni buraya gelecek.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === "whimsical" && (
              <motion.div
                key="whimsical"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full aspect-video card-gradient rounded-sm flex items-center justify-center border border-border"
              >
                <div className="text-center">
                  <Map className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Whimsical embed linki buraya eklenecek
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "hikaye" && (
              <motion.div
                key="hikaye"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center"
              >
                {/* İçindekiler - Sticky Sol Taraf */}
                <aside className="hidden lg:block w-48 shrink-0">
                  <div className="sticky top-32 pr-6">
                    <h3 className="text-xs text-primary tracking-[0.2em] uppercase mb-4">
                      İÇİNDEKİLER
                    </h3>
                    <nav className="space-y-1">
                      {storyContent.map((section, index) => (
                        <motion.button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`block w-full text-left px-3 py-2 text-xs tracking-wide transition-all duration-300 border-l-2 ${
                            activeSection === section.id
                              ? "border-primary text-primary bg-primary/5"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {section.title}
                        </motion.button>
                      ))}
                    </nav>
                  </div>
                </aside>

                {/* Story Content - Glass Effect */}
                <div
                  ref={contentRef}
                  className="w-full max-w-4xl max-h-[65vh] overflow-y-auto"
                >
                  <div className="bg-background/40 backdrop-blur-md border border-border/50 rounded-sm p-10 md:p-14 shadow-xl">
                    {storyContent.map((section, index) => (
                      <motion.section
                        key={section.id}
                        data-section={section.id}
                        className={`mb-12 ${index !== 0 ? "pt-10 border-t border-border/30" : ""}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h2 className="text-2xl md:text-3xl font-display text-foreground mb-6 tracking-wide">
                          {section.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {section.content}
                        </p>
                      </motion.section>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hikaye;
