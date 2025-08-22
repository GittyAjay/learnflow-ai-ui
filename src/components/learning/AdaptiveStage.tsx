import { LearningPathStep } from '../../lib/api';

interface AdaptiveStageProps {
  currentStep: number;
  learningPath: LearningPathStep[];
  onStartExtraPractice: () => void;
}

export function AdaptiveStage({
  currentStep,
  learningPath,
  onStartExtraPractice,
}: AdaptiveStageProps) {
  const remedialLesson = (learningPath[currentStep]?.remedialLesson) || {
    id: `remedial-${currentStep}`,
    title: `Extra Practice: ${learningPath[currentStep]?.title || ''}`,
    duration: '8 min',
    thumbnail: '🔄',
    videoUrl: '#',
    description: 'Additional practice to strengthen understanding'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-red-900 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4">{remedialLesson.thumbnail}</div>
          <h2 className="text-2xl font-bold text-white mb-4">Adaptive Learning in Action!</h2>
          <p className="text-gray-300 mb-6">
            Based on your quiz results, I've added an extra practice session to help you master this concept.
          </p>

          <div className="bg-orange-500/20 rounded-xl p-6 mb-6 border border-orange-400/30">
            <h3 className="text-white font-semibold text-lg mb-2">
              {remedialLesson.title}
            </h3>
            <p className="text-gray-300">{remedialLesson.description}</p>
          </div>

          <button
            onClick={onStartExtraPractice}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:from-orange-400 hover:to-red-400"
          >
            Start Extra Practice
          </button>
        </div>
      </div>
    </div>
  );
} 