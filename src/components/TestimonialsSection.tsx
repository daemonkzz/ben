import testimonialBg from "@/assets/testimonial-bg.png";

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="font-display text-[50px] md:text-[70px] lg:text-[90px] text-foreground leading-[0.9] tracking-tight italic">
            THEY'LL TELL<br />YOU BETTER
          </h2>
        </div>

        {/* Testimonial Cards - Fan Layout */}
        <div className="relative max-w-4xl mx-auto mb-8">
          <div className="flex justify-center items-end gap-0 relative h-[280px] md:h-[320px]">
            {/* Left Card - Tilted */}
            <div className="absolute left-1/2 -translate-x-[180%] md:-translate-x-[160%] w-48 md:w-56 h-56 md:h-64 bg-secondary/40 rounded-[24px] border border-border/20 transform -rotate-12 origin-bottom" />
            
            {/* Center Card - Prominent */}
            <div className="relative w-52 md:w-64 h-60 md:h-72 bg-secondary/50 rounded-[24px] border border-border/30 z-10 transform translate-y-4" />
            
            {/* Right Card - Tilted */}
            <div className="absolute left-1/2 translate-x-[80%] md:translate-x-[60%] w-48 md:w-56 h-56 md:h-64 bg-secondary/40 rounded-[24px] border border-border/20 transform rotate-12 origin-bottom" />
          </div>
          
          {/* Portal Glow Effect */}
          <div className="relative mx-auto mt-4">
            <div className="w-full max-w-md mx-auto h-24 bg-gradient-to-t from-primary via-primary/60 to-transparent rounded-full blur-sm opacity-80" />
            <div className="absolute inset-0 w-full max-w-lg mx-auto h-20 bg-primary/40 rounded-full blur-xl" />
          </div>
        </div>

        {/* Update Notes Section */}
        <div className="text-center mt-24">
          <h3 className="font-display text-xl md:text-2xl text-foreground mb-10 tracking-[0.2em] uppercase">UPDATE NOTES</h3>
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="aspect-square bg-secondary/30 rounded-[24px] md:rounded-[32px] border border-border/10 hover:border-border/30 transition-all duration-300 cursor-pointer group hover:bg-secondary/50"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
