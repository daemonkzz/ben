import { Button } from "@/components/ui/button";
import portalSilhouette from "@/assets/portal-silhouette.png";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-sm mx-auto text-center">
          {/* Portal Image */}
          <div className="mb-6 relative">
            <div className="relative mx-auto w-64 md:w-72">
              <img 
                src={portalSilhouette} 
                alt="Enter the portal" 
                className="w-full rounded-[32px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-[32px]" />
            </div>
          </div>

          {/* CTA Button */}
          <Button variant="glow" size="lg" className="animate-glow-pulse rounded-full px-10">
            Book now →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
