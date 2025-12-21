import { Button } from "@/components/ui/button";
import portalSilhouette from "@/assets/portal-silhouette.png";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-md mx-auto text-center">
          {/* Portal Image with Woman Silhouette */}
          <div className="mb-0 relative">
            <div className="relative mx-auto w-72 md:w-80 aspect-[3/4] rounded-[32px] overflow-hidden">
              <img 
                src={portalSilhouette} 
                alt="Enter the portal" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </div>

          {/* CTA Button */}
          <Button variant="glow" size="lg" className="animate-glow-pulse px-12 py-6 text-sm font-medium rounded-sm">
            Book now <span className="ml-2">↗</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
