import { Lightbulb, Users, Clock, Key } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Mind-Bending Puzzles",
    description: "Challenge your intellect with intricate puzzles designed to test your problem-solving skills."
  },
  {
    icon: Users,
    title: "Team Experience", 
    description: "Work together with friends, family, or colleagues to escape. Communication is key!"
  },
  {
    icon: Clock,
    title: "Race Against Time",
    description: "You have 60 minutes to complete your mission. Every second counts in this adventure."
  },
  {
    icon: Key,
    title: "Immersive Themes",
    description: "Step into professionally designed rooms with atmospheric settings and realistic props."
  }
];

const WhatIsSection = () => {
  return (
    <section id="quests" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="mb-20 animate-fade-in-up">
          <h2 className="font-display text-[60px] md:text-[80px] lg:text-[100px] text-foreground leading-[0.9] tracking-tight">
            WHAT<br />
            IS <span className="text-primary text-glow">X PORTAL</span>?
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Description */}
          <div className="lg:col-span-3">
            <p className="text-foreground/40 text-xs leading-relaxed">
              X Portal is an immersive escape room experience that transports you 
              into another dimension. Our cutting-edge rooms combine technology and storytelling.
            </p>
          </div>

          {/* Center - Large Portal Image placeholder */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-48 h-72 md:w-56 md:h-80 rounded-[40px] bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <span className="text-primary font-display text-[120px] opacity-60">✕</span>
            </div>
          </div>

          {/* Right - Feature Cards */}
          <div className="lg:col-span-4 space-y-4">
            {features.slice(0, 2).map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-secondary/50 rounded-2xl p-4 hover:bg-secondary/70 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-1">{feature.title}</h3>
                    <p className="text-[11px] text-foreground/40 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto lg:ml-auto lg:mr-0">
          {features.slice(2, 4).map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-secondary/50 rounded-2xl p-4 hover:bg-secondary/70 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${(index + 2) * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-sm text-foreground mb-1">{feature.title}</h3>
                  <p className="text-[11px] text-foreground/40 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;
