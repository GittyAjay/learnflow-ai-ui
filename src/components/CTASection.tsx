import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-ai opacity-5 rounded-3xl blur-3xl" />
          
          <div className="relative bg-card rounded-3xl p-12 shadow-card border border-ai-primary/10">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-gradient-ai/10 px-4 py-2 rounded-full border border-ai-primary/20">
                <Sparkles className="h-4 w-4 text-ai-primary" />
                <span className="text-sm font-semibold text-ai-primary">AI-Powered Learning</span>
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Learn Smarter.
              <br />
              <span className="bg-gradient-ai bg-clip-text text-transparent">Not Harder.</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of learners who've discovered the power of adaptive, AI-guided education. 
              Start your personalized learning journey today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" variant="glow" className="group text-lg px-10">
                Start Your Free Adaptive Path
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-muted-foreground">
              Free forever • No credit card required • 5-minute setup
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}