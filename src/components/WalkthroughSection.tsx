import { Play, CheckCircle, AlertCircle, Book } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WalkthroughSection() {
  const steps = [
    {
      icon: Play,
      title: "Learning Loops",
      description: "Student watches Python loops tutorial",
      status: "completed",
      color: "green"
    },
    {
      icon: AlertCircle,
      title: "Quiz Challenge",
      description: "Takes quiz but gets range() function wrong",
      status: "current",
      color: "yellow"
    },
    {
      icon: Book,
      title: "AI Intervention",
      description: "AI detects gap and inserts range() lesson",
      status: "inserted",
      color: "blue"
    },
    {
      icon: CheckCircle,
      title: "Seamless Continuation",
      description: "Returns to original path with new knowledge",
      status: "ready",
      color: "green"
    }
  ];

  return (
    <section className="py-24 px-4 bg-surface-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how LearnFlow AI adapts in real-time to fill knowledge gaps exactly when they're discovered
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const colorClasses = {
              green: "bg-green-100 border-green-200 text-green-700",
              yellow: "bg-yellow-100 border-yellow-200 text-yellow-700",
              blue: "bg-blue-100 border-blue-200 text-blue-700"
            };
            
            return (
              <Card 
                key={step.title}
                className={`p-6 relative overflow-hidden transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1 ${
                  step.status === 'current' ? 'ring-2 ring-ai-primary animate-glow' : ''
                } ${
                  step.status === 'inserted' ? 'ring-2 ring-ai-secondary' : ''
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                  colorClasses[step.color]
                }`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                
                {/* Special highlight for AI intervention */}
                {step.status === 'inserted' && (
                  <div className="mt-4 p-2 bg-gradient-ai/10 rounded-lg border border-ai-secondary/20">
                    <div className="text-xs text-ai-secondary font-semibold">🤖 AI Adaptive Insert</div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        
        {/* Connection Lines */}
        <div className="hidden lg:block relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-green-300 via-yellow-300 via-blue-300 to-green-300 -translate-y-1/2" 
               style={{ top: '-120px', zIndex: -1 }} />
        </div>
      </div>
    </section>
  );
}