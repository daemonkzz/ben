import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "WILL WE REALLY BE LOCKED IN A ROOM?",
    answer: "No, you won't actually be locked in. Safety is our top priority. All doors have emergency exits, and our game masters monitor the rooms at all times. You can leave whenever you need to."
  },
  {
    question: "WHAT DO WE DO IF WE GET STUCK AND CAN'T SOLVE A RIDDLE?",
    answer: "Don't worry! Our game masters are always watching and ready to provide hints when needed. You can request a hint at any time through our in-room communication system."
  },
  {
    question: "HOW SCARY IS YOUR QUEST?",
    answer: "Our rooms vary in intensity. Some have light thriller elements while others are purely puzzle-focused. We clearly label each room's scare level so you can choose what's comfortable for you."
  },
  {
    question: "IS THE QUEST SUITABLE FOR CHILDREN?",
    answer: "Yes! We have family-friendly rooms suitable for children aged 10 and up. Children under 14 must be accompanied by an adult. We recommend checking each room's difficulty rating."
  },
  {
    question: "HOW MANY PEOPLE CAN PARTICIPATE IN THE GAME?",
    answer: "Our rooms accommodate 2-6 players, depending on the specific quest. We recommend 3-5 players for the optimal experience. Larger groups can book multiple rooms for a team competition!"
  },
  {
    question: "DO YOU NEED SKILLS OR FITNESS?",
    answer: "No special skills or physical fitness required! Our puzzles rely on logic, observation, and teamwork. The rooms are accessible and don't require climbing or strenuous activity."
  },
  {
    question: "HOW ARE BOOKINGS AND PAYMENTS MADE?",
    answer: "Book online through our website or call us directly. We accept all major credit cards, cash, and digital payment methods. A small deposit is required to confirm your booking."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-display text-[60px] md:text-[80px] text-foreground tracking-tight">FAQ</h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          <Accordion type="single" collapsible>
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-0 mb-3"
              >
                <AccordionTrigger className="flex items-center justify-between w-full text-left bg-secondary/40 hover:bg-secondary/60 rounded-full px-6 py-4 transition-all duration-300 group data-[state=open]:rounded-t-[24px] data-[state=open]:rounded-b-none [&>svg]:hidden">
                  <span className="font-display text-xs md:text-sm text-foreground tracking-wide pr-4">
                    {item.question}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <ChevronDown className="w-3 h-3 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-secondary/40 rounded-b-[24px] px-6 pb-4 pt-0">
                  <p className="text-foreground/50 text-xs md:text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
