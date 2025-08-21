import { Frown, Youtube, ArrowRight } from "lucide-react";

export default function ProblemSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Side - Visual Problem */}
          <div className="relative">
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Youtube className="h-6 w-6 text-red-500" />
                <span className="font-semibold">Typical Learning Experience</span>
              </div>
              
              {/* Messy Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-sm text-red-700">Advanced React Patterns (assumes hooks knowledge)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-sm text-yellow-700">useState Hook Tutorial (what you needed first)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-sm text-red-700">Complex State Management (still confused)</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <Frown className="h-8 w-8 text-gray-400 mr-3" />
                <span className="text-gray-600 font-medium">Gives up after 2 hours</span>
              </div>
            </div>
          </div>
          
          {/* Right Side - Text */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Millions quit learning daily because tutorials 
              <span className="text-red-500"> assume prior knowledge</span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              You find a great tutorial, but it jumps ahead too fast. You're missing foundational concepts, 
              but don't know what you don't know. Sound familiar?
            </p>
            
            <div className="flex items-center gap-4 text-ai-primary font-semibold">
              <span>LearnFlow AI fixes this</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}