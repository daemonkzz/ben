import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { MainCategory, SubCategory, Rule } from "@/types/rules";
import { kazeRulesData } from "@/data/rulesData";

const rulesData: MainCategory[] = kazeRulesData;

const Kurallar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1"]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>(["1.1"]);
  const [activeRule, setActiveRule] = useState<string | null>(null);
  const [rulesFromDb, setRulesFromDb] = useState<MainCategory[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch rules from database
  useEffect(() => {
    const fetchRules = async () => {
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .limit(1)
        .maybeSingle();

      // Only use DB rules if they have enough categories (new format has 2 main categories with many subcategories)
      if (!error && data && Array.isArray(data.data) && data.data.length > 0) {
        const dbRules = data.data as MainCategory[];
        // Check if DB has updated rules (should have at least 8 subcategories in first category)
        const hasUpdatedRules = dbRules[0]?.subCategories?.length >= 8;
        if (hasUpdatedRules) {
          setRulesFromDb(dbRules);
          setLastUpdated(data.updated_at);
        }
      }
    };
    fetchRules();
  }, []);

  // Use database rules if available, otherwise fallback to static data
  const currentRulesData = rulesFromDb || rulesData;

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleSubCategory = (id: string) => {
    setExpandedSubCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const scrollToRule = (ruleId: string) => {
    setActiveRule(ruleId);
    const element = sectionRefs.current[ruleId];
    if (element) {
      // Calculate position to center the element on screen
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = window.pageYOffset + elementRect.top;
      const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
      window.scrollTo({ top: middle, behavior: "smooth" });
    }
  };

  // Filter rules based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return currentRulesData;

    const query = searchQuery.toLowerCase();
    
    return currentRulesData
      .map((category) => ({
        ...category,
        subCategories: category.subCategories
          .map((subCat) => ({
            ...subCat,
            rules: subCat.rules.filter((rule) =>
              rule.title.toLowerCase().includes(query) ||
              rule.description.toLowerCase().includes(query) ||
              rule.id.toLowerCase().includes(query)
            ),
          }))
          .filter((subCat) => subCat.rules.length > 0),
      }))
      .filter((category) => category.subCategories.length > 0);
  }, [searchQuery, currentRulesData]);

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const categoryIds = filteredData.map((c) => c.id);
      const subCategoryIds = filteredData.flatMap((c) =>
        c.subCategories.map((sc) => sc.id)
      );
      setExpandedCategories(categoryIds);
      setExpandedSubCategories(subCategoryIds);
    }
  }, [searchQuery, filteredData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)",
          }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.03) 0%, transparent 60%)",
          }}
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, delay: 5 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.02) 0%, transparent 60%)",
          }}
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, delay: 3 }}
        />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${15 + (i * 11) % 70}%`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, (i % 2 === 0 ? 20 : -20), 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 12 + (i * 2),
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          {/* Page Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-[50px] md:text-[70px] lg:text-[90px] text-foreground leading-[0.9] tracking-tight italic uppercase font-bold">
              <span className="text-primary">KAZE</span>-Z
            </h1>
            <h2 className="font-display text-[32px] md:text-[42px] lg:text-[52px] text-foreground leading-[0.9] tracking-tight italic uppercase font-bold mt-2">
              KURALLARI
            </h2>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <Input
                type="text"
                placeholder="Kural ara... (örn: RDM, VDM, soygun)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 bg-secondary/30 border-border/20 text-foreground placeholder:text-foreground/40 rounded-xl text-base focus:border-primary/50 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-foreground/50 text-sm mt-2 text-center">
                {filteredData.reduce((acc, cat) => 
                  acc + cat.subCategories.reduce((acc2, sub) => acc2 + sub.rules.length, 0), 0
                )} sonuç bulundu
              </p>
            )}
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Sidebar Navigation */}
            <motion.aside
              className="lg:w-80 flex-shrink-0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="lg:sticky lg:top-28 bg-secondary/30 rounded-2xl p-4 md:p-5 border border-border/20 max-h-[70vh] overflow-y-auto">
                <h3 className="text-primary font-display text-lg italic mb-4 tracking-wide">
                  Kural Kategorileri
                </h3>
                <nav className="space-y-1">
                  {filteredData.map((category) => (
                    <div key={category.id}>
                      {/* Main Category */}
                      <motion.button
                        onClick={() => toggleCategory(category.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2 ${
                          expandedCategories.includes(category.id)
                            ? "bg-primary/15 text-primary"
                            : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-primary/60 font-mono text-xs w-4">{category.id}.</span>
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{category.title}</span>
                      </motion.button>

                      {/* Sub Categories */}
                      <AnimatePresence>
                        {expandedCategories.includes(category.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 mt-1 space-y-1 border-l border-border/20 pl-2">
                              {category.subCategories.map((subCat) => (
                                <div key={subCat.id}>
                                  <motion.button
                                    onClick={() => toggleSubCategory(subCat.id)}
                                    className={`w-full text-left px-2 py-2 rounded-md transition-all duration-300 text-xs flex items-center gap-1.5 ${
                                      expandedSubCategories.includes(subCat.id)
                                        ? "bg-primary/10 text-primary"
                                        : "text-foreground/60 hover:text-foreground hover:bg-secondary/40"
                                    }`}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <span className="text-primary/50 font-mono text-[10px] w-6">{subCat.id}</span>
                                    {expandedSubCategories.includes(subCat.id) ? (
                                      <ChevronDown className="w-3 h-3 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{subCat.title}</span>
                                  </motion.button>

                                  {/* Rules in Sidebar */}
                                  <AnimatePresence>
                                    {expandedSubCategories.includes(subCat.id) && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/10 pl-2">
                                          {subCat.rules.map((rule) => (
                                            <motion.button
                                              key={rule.id}
                                              onClick={() => scrollToRule(rule.id)}
                                              className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-all duration-200 flex items-start gap-1.5 ${
                                                activeRule === rule.id
                                                  ? "bg-primary/20 text-primary"
                                                  : "text-foreground/50 hover:text-foreground/80 hover:bg-secondary/30"
                                              }`}
                                              whileHover={{ x: 2 }}
                                            >
                                              <span className="text-primary/40 font-mono flex-shrink-0">{rule.id}</span>
                                              <span className="truncate">{rule.title}</span>
                                            </motion.button>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.div
              className="flex-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredData.length === 0 ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-foreground/50 text-lg">Arama sonucu bulunamadı.</p>
                  <p className="text-foreground/30 text-sm mt-2">Farklı anahtar kelimeler deneyin.</p>
                </motion.div>
              ) : (
                filteredData.map((category) => (
                  <motion.div
                    key={category.id}
                    className="mb-12"
                    variants={itemVariants}
                  >
                    {/* Main Category Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-primary font-display text-[50px] md:text-[60px] italic leading-none opacity-30">
                        {category.id}
                      </span>
                      <h3 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground italic tracking-wide">
                        {category.title}
                      </h3>
                    </div>

                    {/* Sub Categories */}
                    <div className="space-y-10">
                      {category.subCategories.map((subCat) => (
                        <div key={subCat.id} className="ml-4 md:ml-8">
                          {/* Sub Category Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-secondary/50 border border-border/30 text-foreground/70 font-mono text-sm px-3 py-1 rounded-md">
                              {subCat.id}
                            </span>
                            <h4 className="font-display text-xl md:text-2xl lg:text-3xl text-primary italic">
                              {category.id}. {subCat.title}
                            </h4>
                          </div>
                          {subCat.description && (
                            <p className="text-foreground/50 text-sm mb-6 ml-1">
                              {subCat.description}
                            </p>
                          )}

                          {/* Rules Cards */}
                          <div className="space-y-4">
                            {subCat.rules.map((rule) => (
                              <motion.div
                                key={rule.id}
                                ref={(el) => (sectionRefs.current[rule.id] = el)}
                                className="relative overflow-hidden rounded-2xl"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                              >
                                {/* One-time Sweep Glow Effect */}
                                <AnimatePresence mode="wait">
                                  {activeRule === rule.id && (
                                    <motion.div
                                      key={`glow-${rule.id}-${Date.now()}`}
                                      className="absolute inset-0 rounded-2xl pointer-events-none"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {/* Traveling glow */}
                                      <motion.div
                                        className="absolute top-0 left-0 w-full h-full"
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "200%" }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                      >
                                        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-md" />
                                      </motion.div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Card Content */}
                                <motion.div
                                  className={`relative bg-secondary/30 rounded-2xl p-5 md:p-6 border transition-all duration-500 ${
                                    activeRule === rule.id
                                      ? "border-primary/60 bg-secondary/50 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]"
                                      : "border-border/20 hover:border-primary/30"
                                  }`}
                                  animate={activeRule === rule.id ? { 
                                    scale: [1, 1.005, 1],
                                  } : { scale: 1 }}
                                  transition={{ 
                                    scale: { duration: 0.3, ease: "easeOut" }
                                  }}
                                >
                                  {/* Rule Header */}
                                  <div className="flex items-center gap-3 mb-4">
                                    <span className={`font-mono text-xs px-2.5 py-1 rounded-md transition-all duration-300 ${
                                      activeRule === rule.id 
                                        ? "bg-primary/30 border border-primary/50 text-primary" 
                                        : "bg-secondary/60 border border-border/40 text-foreground/60"
                                    }`}>
                                      {rule.id}
                                    </span>
                                    <h5 className="font-display text-lg md:text-xl text-primary italic">
                                      {searchQuery ? (
                                        <HighlightText text={rule.title} query={searchQuery} />
                                      ) : (
                                        rule.title
                                      )}
                                    </h5>
                                  </div>

                                  {/* Rule Description with bullet point */}
                                  <div className="flex items-start gap-3 ml-1">
                                    <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                                    <p className="text-foreground/80 text-sm md:text-base leading-relaxed">
                                      {searchQuery ? (
                                        <HighlightText text={rule.description} query={searchQuery} />
                                      ) : (
                                        rule.description
                                      )}
                                    </p>
                                  </div>

                                  {/* Last Update */}
                                  {rule.lastUpdate && (
                                    <div className="flex justify-end mt-4">
                                      <span className="text-foreground/30 text-xs font-mono">
                                        Son güncelleme: {rule.lastUpdate}
                                      </span>
                                    </div>
                                  )}
                                </motion.div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}

              {/* Footer Note */}
              <motion.div
                className="bg-primary/10 rounded-2xl p-6 md:p-8 border border-primary/20 mt-8"
                variants={itemVariants}
              >
                <p className="text-foreground/70 text-sm md:text-base leading-relaxed">
                  <span className="text-primary font-semibold">Not:</span> Bu kurallar sunucu yönetimi tarafından herhangi bir zamanda güncellenebilir. 
                  Kurallardaki değişiklikler Discord sunucusu üzerinden duyurulacaktır. Tüm oyuncuların kuralları düzenli olarak kontrol etmesi önerilir.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Helper component to highlight search matches
const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="bg-primary/30 text-primary font-medium px-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export default Kurallar;
