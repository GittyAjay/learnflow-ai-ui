import heroBackground from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate("/startLearning");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          Stop Getting Stuck.
          <br />
          <span className="bg-gradient-ai bg-clip-text text-transparent">
            Start Learning Smarter.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-fade-in max-w-3xl mx-auto">
          AI-powered adaptive learning paths built from the best free videos.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
          <Button
            size="lg"
            variant="glow"
            className="group"
            onClick={handleStartLearning}
          >
            Start Learning Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button size="lg" variant="outline" className="group">
            <Play className="mr-2 h-5 w-5" />
            See How It Works
          </Button>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-ai-primary/20 rounded-full animate-float" />
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-ai-secondary/20 rounded-full animate-float" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 right-8 w-12 h-12 bg-gradient-ai rounded-full animate-float" style={{animationDelay: '2s'}} />
      </div>
    </section>
  );
}