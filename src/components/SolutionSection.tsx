import { ArrowRight, Brain, CheckCircle } from "lucide-react";

export default function SolutionSection() {
  const learningPath = [
    { title: "Variables", status: "completed" },
    { title: "Loops", status: "completed" },
    { title: "Functions", status: "current" },
    { title: "NumPy", status: "locked" },
    { title: "Pandas", status: "locked" },
    { title: "Matplotlib", status: "locked" }
  ];

  return (
    <section className="py-24 px-4 bg-surface-secondary">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-ai bg-clip-text text-transparent">LearnFlow AI</span> Creates Your Adaptive Path
        </h2>
        
        <p className="text-xl text-muted-foreground mb-16 max-w-3xl mx-auto">
          Our AI analyzes thousands of free educational videos to create a personalized, 
          structured learning journey that adapts to your knowledge gaps in real-time.
        </p>
        
        {/* Learning Path Visualization */}
        <div className="bg-card rounded-2xl p-8 shadow-card mb-12">
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {learningPath.map((item, index) => (
              <div key={item.title} className="flex items-center">
                <div className={`
                  px-6 py-3 rounded-xl font-semibold transition-all duration-300
                  ${item.status === 'completed' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : item.status === 'current'
                    ? 'bg-gradient-ai text-white animate-glow'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }
                `}>
                  {item.status === 'completed' && <CheckCircle className="inline mr-2 h-4 w-4" />}
                  {item.status === 'current' && <Brain className="inline mr-2 h-4 w-4" />}
                  {item.title}
                </div>
                
                {index < learningPath.length - 1 && (
                  <ArrowRight className={`h-5 w-5 mx-2 ${
                    item.status === 'completed' ? 'text-green-500' : 'text-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* AI Adaptation Highlight */}
          <div className="bg-gradient-hero border border-ai-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-6 w-6 text-ai-primary" />
              <span className="font-semibold text-ai-primary">AI Real-Time Adaptation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Student struggles with "range() function" → AI instantly inserts a 5-minute prerequisite video → 
              Learning continues seamlessly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}