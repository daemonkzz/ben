import { Phone, Youtube, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 border-t border-border/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Icons */}
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

          {/* Center Navigation with Logo */}
          <div className="flex items-center gap-6 md:gap-8">
            <a href="#quests" className="text-foreground/50 hover:text-primary transition-colors text-[10px] uppercase tracking-wider">Quests</a>
            <a href="#lobby" className="text-foreground/50 hover:text-primary transition-colors text-[10px] uppercase tracking-wider">Lobby</a>
            
            {/* Center Logo */}
            <div className="flex flex-col items-center mx-2">
              <span className="text-primary font-display text-xl leading-none">✕</span>
              <span className="text-foreground font-display text-[8px] tracking-[0.15em] leading-tight text-center uppercase">Escape<br/>Room</span>
            </div>
            
            <a href="#gallery" className="text-foreground/50 hover:text-primary transition-colors text-[10px] uppercase tracking-wider">Gallery</a>
            <a href="#faq" className="text-foreground/50 hover:text-primary transition-colors text-[10px] uppercase tracking-wider">FAQ</a>
          </div>

          {/* Info */}
          <div className="text-right text-[9px] text-foreground/30 leading-relaxed">
            <p>Photography</p>
            <p>Designed by PORTAL STUDIO</p>
            <p>© X-Portal-Escape 2024</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
