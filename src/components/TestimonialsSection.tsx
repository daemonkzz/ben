import testimonialBg from "@/assets/testimonial-bg.png";

const TestimonialsSection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-display text-[50px] md:text-[70px] lg:text-[90px] text-foreground leading-[0.9] tracking-tight">
            THEY'LL TELL<br />YOU BETTER
          </h2>
        </div>

        {/* Testimonial Video/Image Area */}
        <div className="relative max-w-3xl mx-auto mb-24">
          <div className="aspect-video rounded-[32px] overflow-hidden bg-secondary/30 relative">
            <img 
              src={testimonialBg} 
              alt="Mysterious portal" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            {/* Spotlight effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/30 blur-3xl rounded-full animate-spotlight" />
          </div>
        </div>

        {/* Update Notes Section */}
        <div className="text-center">
          <h3 className="font-display text-2xl md:text-3xl text-foreground mb-10 tracking-wider">UPDATE NOTES</h3>
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="aspect-square bg-secondary/40 rounded-[24px] md:rounded-[32px] border border-border/20 hover:border-primary/20 transition-all duration-300 cursor-pointer group hover:bg-secondary/60"
              >
                <div className="w-full h-full flex items-center justify-center p-4">
                  <span className="text-foreground/20 text-xs group-hover:text-foreground/40 transition-colors text-center">
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
