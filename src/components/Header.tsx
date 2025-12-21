import { useState } from "react";
import { Menu, X, Phone, Youtube, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "QUESTS", href: "#quests" },
    { label: "LOBBY", href: "#lobby" },
    { label: "GALLERY/EVENTS", href: "#gallery" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Social Icons - Left */}
          <div className="flex items-center gap-2">
            <a href="#" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform">
              <Phone className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform">
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform">
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-primary font-display text-2xl leading-none">✕</span>
            <span className="text-foreground font-display text-[10px] tracking-[0.2em] leading-tight text-center uppercase">Escape<br/>Room</span>
          </div>

          {/* Desktop Navigation - Right side */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground/70 hover:text-primary transition-colors text-[11px] font-medium tracking-wider uppercase"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            
            <Button variant="hero" size="sm" className="text-xs px-4 h-8">
              Book now →
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 mt-4 border-t border-border/30 animate-fade-in bg-background/90 backdrop-blur-md rounded-xl">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block py-3 px-4 text-foreground/70 hover:text-primary transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="px-4 pt-2">
              <Button variant="hero" size="sm" className="w-full">
                Book now →
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
