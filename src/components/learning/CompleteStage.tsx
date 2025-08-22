import { Award, Brain, CheckCircle, RotateCcw } from 'lucide-react';

interface CompleteStageProps {
  topic: string;
  completedSteps: Set<number>;
  onReset: () => void;
}

export function CompleteStage({ topic, completedSteps, onReset }: CompleteStageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-teal-900 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-6">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-4">Congratulations!</h2>
          <p className="text-gray-300 mb-6">
            You've completed your learning journey in <span className="text-teal-400 font-semibold">{topic}</span>
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Journey Complete</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <p className="text-white font-semibold">{completedSteps.size} Topics Mastered</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-semibold">AI Personalized</p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:from-teal-400 hover:to-green-400 flex items-center mx-auto"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Start New Learning Journey
          </button>
        </div>
      </div>
    </div>
  );
} 