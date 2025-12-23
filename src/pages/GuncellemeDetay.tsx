import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Calendar, Tag, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ContentSection {
  id: string;
  type: "heading" | "subheading" | "paragraph" | "list" | "image";
  content: string | string[];
}

interface UpdateDetail {
  id: number;
  title: string;
  subtitle?: string;
  category: "update" | "news";
  version?: string;
  date: string;
  author?: string;
  image: string;
  sections: ContentSection[];
}

// Sample detailed update data
const updatesData: UpdateDetail[] = [
  {
    id: 1,
    title: "Yeni Sezon Başlangıcı - Büyük Güncelleme",
    subtitle: "Sezon 3 ile birlikte gelen tüm yenilikler",
    category: "update",
    version: "v2.1.0",
    date: "23 Aralık 2024",
    author: "Kaze Ekibi",
    image: "/lovable-uploads/dd368db9-058d-4606-b265-f0f7a4014bb6.jpg",
    sections: [
      {
        id: "giris",
        type: "heading",
        content: "Giriş"
      },
      {
        id: "giris-text",
        type: "paragraph",
        content: "Yeni sezonumuz başlıyor! Bu büyük güncelleme ile birlikte sunucumuza birçok yeni özellik, iyileştirme ve içerik ekliyoruz. Oyuncularımızın geri bildirimleri doğrultusunda hazırladığımız bu güncelleme, deneyiminizi bir üst seviyeye taşıyacak."
      },
      {
        id: "yeni-ozellikler",
        type: "heading",
        content: "Yeni Özellikler"
      },
      {
        id: "yeni-ozellikler-list",
        type: "list",
        content: [
          "Yeni karakter sınıfı: Büyücü - Güçlü büyüler ve area etkili yeteneklerle donatılmış",
          "Yeni harita bölgesi: Kayıp Vadisi - Keşfedilmeyi bekleyen gizemli bir alan",
          "Geliştirilmiş envanter sistemi - Daha fazla alan ve kolay yönetim",
          "Yeni zanaat sistemi - Eşya üretimi artık daha detaylı"
        ]
      },
      {
        id: "denge-degisiklikleri",
        type: "heading",
        content: "Denge Değişiklikleri"
      },
      {
        id: "denge-subhead",
        type: "subheading",
        content: "Savaşçı Sınıfı"
      },
      {
        id: "denge-text",
        type: "paragraph",
        content: "Savaşçı sınıfının temel saldırı hasarı %10 artırıldı. Zırh penetrasyonu yeteneği yeniden dengelendi ve artık daha tutarlı sonuçlar veriyor."
      },
      {
        id: "bug-fixes",
        type: "heading",
        content: "Hata Düzeltmeleri"
      },
      {
        id: "bug-list",
        type: "list",
        content: [
          "Oyuncuların ara sıra görünmez olmasına neden olan hata düzeltildi",
          "Envanter kaybına neden olan nadir hata giderildi",
          "Performans iyileştirmeleri yapıldı"
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Kış Etkinliği Başladı! Özel Ödüller Sizi Bekliyor",
    subtitle: "Sınırlı süreli etkinlik ile özel ödüller kazanın",
    category: "news",
    date: "21 Aralık 2024",
    author: "Etkinlik Ekibi",
    image: "/lovable-uploads/dd368db9-058d-4606-b265-f0f7a4014bb6.jpg",
    sections: [
      {
        id: "etkinlik-giris",
        type: "heading",
        content: "Kış Festivali"
      },
      {
        id: "etkinlik-text",
        type: "paragraph",
        content: "Kış festivali başladı! Bu özel etkinlik süresince haritada kar yağışı olacak ve özel görevler aktif olacak. Tüm görevleri tamamlayan oyuncular özel kış temalı kostümler kazanacak."
      }
    ]
  },
  {
    id: 3,
    title: "Sunucu Bakım Duyurusu",
    subtitle: "Planlı bakım çalışması hakkında bilgilendirme",
    category: "update",
    version: "v2.0.5",
    date: "20 Aralık 2024",
    author: "Teknik Ekip",
    image: "/lovable-uploads/dd368db9-058d-4606-b265-f0f7a4014bb6.jpg",
    sections: [
      {
        id: "bakim-bilgi",
        type: "heading",
        content: "Bakım Detayları"
      },
      {
        id: "bakim-text",
        type: "paragraph",
        content: "Sunucularımız 20 Aralık saat 03:00 - 06:00 arasında bakımda olacaktır. Bu süre zarfında oyuna erişim mümkün olmayacaktır."
      }
    ]
  },
  {
    id: 4,
    title: "Yeni Harita Eklendi: Kayıp Vadi",
    category: "news",
    date: "16 Aralık 2024",
    author: "İçerik Ekibi",
    image: "/lovable-uploads/dd368db9-058d-4606-b265-f0f7a4014bb6.jpg",
    sections: []
  },
  {
    id: 5,
    title: "Performans İyileştirmeleri ve Hata Düzeltmeleri",
    category: "update",
    version: "v2.0.4",
    date: "10 Aralık 2024",
    author: "Teknik Ekip",
    image: "/lovable-uploads/dd368db9-058d-4606-b265-f0f7a4014bb6.jpg",
    sections: []
  },
  {
    id: 6,
    title: "Topluluk Turnuvası Duyurusu",
    category: "news",
    date: "09 Aralık 2024",
    author: "Topluluk Ekibi",
    image: "/lovable-uploads/dd368db9-058d-4606-b265-f0f7a4014bb6.jpg",
    sections: []
  }
];

const GuncellemeDetay = () => {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState<string>("");
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const update = updatesData.find((u) => u.id === Number(id));
  const otherUpdates = updatesData.filter((u) => u.id !== Number(id)).slice(0, 5);
  
  // Get only heading sections for navigation
  const headingSections = update?.sections.filter(s => s.type === "heading") || [];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 300;
      
      for (const section of headingSections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight + 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headingSections]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 150;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
      setActiveSection(sectionId);
    }
  };

  if (!update) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Güncelleme Bulunamadı</h1>
          <Link to="/guncellemeler" className="text-primary hover:underline">
            Güncellemeler sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Hero Image */}
      <motion.div 
        className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={update.image}
          alt={update.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-transparent" />
      </motion.div>

      {/* Title Section */}
      <div className="container mx-auto px-6 -mt-32 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground italic leading-tight mb-4">
            {update.title}
          </h1>
          
          {update.subtitle && (
            <p className="text-foreground/60 text-lg md:text-xl mb-6">
              {update.subtitle}
            </p>
          )}

          {/* Divider */}
          <div className="w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

          {/* Meta badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/50">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm">
              <Tag className="w-3.5 h-3.5" />
              {update.category === "update" ? "Güncelleme" : "Haber"}
            </span>
            
            {update.version && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-foreground/5 border border-foreground/10 rounded-sm">
                {update.version}
              </span>
            )}
            
            {update.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {update.author}
              </span>
            )}
            
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {update.date}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Navigation */}
          <motion.aside
            className="hidden lg:block lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="sticky top-32">
              <h4 className="text-xs uppercase tracking-wider text-foreground/40 mb-4 font-medium">
                İçindekiler
              </h4>
              <nav className="space-y-2">
                {headingSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left text-sm py-1.5 px-3 rounded-sm transition-all duration-200 ${
                      activeSection === section.id
                        ? "text-primary bg-primary/10 border-l-2 border-primary"
                        : "text-foreground/50 hover:text-foreground/80 hover:bg-foreground/5"
                    }`}
                  >
                    {section.content as string}
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Center Content */}
          <motion.main
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="bg-card/30 border border-border/30 rounded-xl p-8 md:p-10">
              {update.sections.length > 0 ? (
                <div className="prose prose-invert max-w-none">
                  {update.sections.map((section, index) => {
                    const isHeading = section.type === "heading";
                    
                    return (
                      <div
                        key={section.id}
                        ref={(el) => {
                          if (isHeading) {
                            sectionRefs.current[section.id] = el;
                          }
                        }}
                        className={isHeading ? "scroll-mt-40" : ""}
                      >
                        {section.type === "heading" && (
                          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground italic mt-8 mb-4 first:mt-0">
                            {section.content as string}
                          </h2>
                        )}
                        
                        {section.type === "subheading" && (
                          <h3 className="font-display text-xl font-semibold text-primary italic mt-6 mb-3">
                            {section.content as string}
                          </h3>
                        )}
                        
                        {section.type === "paragraph" && (
                          <p className="text-foreground/70 leading-relaxed mb-4">
                            {section.content as string}
                          </p>
                        )}
                        
                        {section.type === "list" && (
                          <ul className="space-y-3 mb-6">
                            {(section.content as string[]).map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-foreground/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {section.type === "image" && (
                          <div className="my-6 rounded-lg overflow-hidden border border-border/30">
                            <img
                              src={section.content as string}
                              alt=""
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-foreground/50 text-center py-8">
                  Bu güncelleme için detaylı içerik henüz eklenmedi.
                </p>
              )}
            </div>
          </motion.main>

          {/* Right Sidebar - Latest Updates */}
          <motion.aside
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="sticky top-32">
              <h4 className="text-xs uppercase tracking-wider text-foreground/40 mb-4 font-medium flex items-center gap-2">
                <span className="w-8 h-px bg-primary" />
                Son Güncellemeler
              </h4>
              
              <div className="space-y-3">
                {otherUpdates.map((item) => (
                  <Link
                    key={item.id}
                    to={`/guncellemeler/${item.id}`}
                    className="group block bg-card/20 border border-border/20 rounded-lg p-3 hover:border-primary/30 hover:bg-card/40 transition-all duration-300"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-primary">
                          {item.category === "update" ? "Güncelleme" : "Haber"}
                        </span>
                        <h5 className="text-sm text-foreground/80 group-hover:text-foreground line-clamp-2 leading-tight mt-0.5">
                          {item.title}
                        </h5>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/10">
                      <span className="text-[10px] text-foreground/40">{item.date}</span>
                      <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to="/guncellemeler"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-6"
              >
                Tümünü Gör
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GuncellemeDetay;
