import { Search, Route, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      title: "AI Curation",
      description: "Our AI scans thousands of educational videos to find the highest-quality, most comprehensive content for your topic."
    },
    {
      icon: Route,
      title: "Structured Path", 
      description: "Videos are intelligently organized into a logical learning sequence, building knowledge step by step."
    },
    {
      icon: Brain,
      title: "Adaptive Magic",
      description: "Real-time assessment detects knowledge gaps and dynamically inserts prerequisite lessons exactly when you need them."
    }
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Three powerful steps that transform chaotic online learning into a structured, adaptive journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card 
                key={step.title}
                className="p-8 text-center hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-ai rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <div className="flex items-center justify-center mb-4">
                  <span className="text-sm font-semibold text-ai-primary bg-ai-primary/10 px-3 py-1 rounded-full">
                    Step {index + 1}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}