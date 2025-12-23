import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Map, BookOpen, Info, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const storyContent = [
  {
    id: "giris",
    title: "Giriş",
    content: `Buraya hikayenin giriş bölümü gelecek. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
  },
  {
    id: "bolum-1",
    title: "Bölüm 1: Başlangıç",
    content: `Buraya birinci bölüm gelecek. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`
  },
  {
    id: "bolum-2",
    title: "Bölüm 2: Yolculuk",
    content: `Buraya ikinci bölüm gelecek. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.`
  },
  {
    id: "bolum-3",
    title: "Bölüm 3: Keşif",
    content: `Buraya üçüncü bölüm gelecek. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`
  },
  {
    id: "son",
    title: "Son",
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

      // Find active section
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <Header />
      
      {/* Progress Bar */}
      {activeTab === "hikaye" && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-muted/50 z-50">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/70"
            style={{ width: `${scrollProgress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      <main className="flex-1 pt-28 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-primary text-sm font-medium tracking-wider uppercase">Keşfet</span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Hikaye & Evren
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Sunucumuzun derin hikayesini ve evrenini keşfedin
            </p>
          </motion.div>

          {/* Tab Buttons with Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center items-center gap-3 mb-10"
          >
            {/* Whimsical Info - Only visible when Whimsical is active */}
            <AnimatePresence>
              {activeTab === "whimsical" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/50 transition-all duration-300">
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs bg-background border border-border shadow-xl p-3">
                      <p className="text-sm text-foreground">
                        Whimsical bilgi metni buraya gelecek. İstediğiniz açıklamayı ekleyebilirsiniz.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Whimsical Button */}
            <motion.button
              onClick={() => setActiveTab("whimsical")}
              className={`relative flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-500 overflow-hidden group ${
                activeTab === "whimsical"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_0_30px_hsl(136_82%_41%/0.4)]"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50 hover:border-border"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === "whimsical" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />
              )}
              <Map className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Whimsical</span>
            </motion.button>

            {/* Divider */}
            <div className="w-px h-8 bg-border/50" />

            {/* Hikaye Button */}
            <motion.button
              onClick={() => setActiveTab("hikaye")}
              className={`relative flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-500 overflow-hidden group ${
                activeTab === "hikaye"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_0_30px_hsl(136_82%_41%/0.4)]"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50 hover:border-border"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === "hikaye" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />
              )}
              <BookOpen className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Hikaye</span>
            </motion.button>

            {/* Hikaye Info - Only visible when Hikaye is active */}
            <AnimatePresence>
              {activeTab === "hikaye" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/50 transition-all duration-300">
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs bg-background border border-border shadow-xl p-3">
                      <p className="text-sm text-foreground">
                        Hikaye bilgi metni buraya gelecek. İstediğiniz açıklamayı ekleyebilirsiniz.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Whimsical Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "whimsical" && (
              <motion.div
                key="whimsical"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full aspect-video bg-gradient-to-br from-muted/80 to-muted/40 rounded-2xl flex items-center justify-center border border-border/50 backdrop-blur-sm shadow-2xl shadow-primary/5"
              >
                <div className="text-center">
                  <Map className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Whimsical embed linki buraya eklenecek
                  </p>
                </div>
              </motion.div>
            )}

            {/* Story Tab */}
            {activeTab === "hikaye" && (
              <motion.div
                key="hikaye"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex gap-8"
              >
                {/* Table of Contents - Left Sidebar */}
                <aside className="hidden lg:block w-72 shrink-0">
                  <div className="sticky top-28">
                    <div className="bg-gradient-to-br from-muted/60 to-muted/30 rounded-2xl p-6 border border-border/50 backdrop-blur-sm">
                      <h3 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        İçindekiler
                      </h3>
                      <nav className="space-y-1">
                        {storyContent.map((section, index) => (
                          <motion.button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`block w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                              activeSection === section.id
                                ? "bg-primary/20 text-primary border-l-3 border-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                                activeSection === section.id 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {index + 1}
                              </span>
                              {section.title}
                            </span>
                          </motion.button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </aside>

                {/* Story Content */}
                <div
                  ref={contentRef}
                  className="flex-1 max-w-3xl mx-auto max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent"
                >
                  <div className="bg-gradient-to-br from-muted/40 to-transparent rounded-2xl p-8 md:p-12 border border-border/30">
                    {storyContent.map((section, index) => (
                      <motion.section
                        key={section.id}
                        data-section={section.id}
                        className={`mb-16 ${index === 0 ? "" : "pt-8 border-t border-border/20"}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <span className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-serif">
                            {section.title}
                          </h2>
                        </div>
                        <p className="text-foreground/80 leading-relaxed text-lg font-serif pl-14">
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
