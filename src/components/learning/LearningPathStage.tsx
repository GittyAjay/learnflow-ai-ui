import { ArrowRight, CheckCircle, Clock, Play } from 'lucide-react';
import { LearningPathStep } from '../../lib/api';
import { calculateProgress } from '../../lib/utils';

interface LearningPathStageProps {
  topic: string;
  learningPath: LearningPathStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (stepIndex: number) => void;
  onContinueLearning: () => void;
}

export function LearningPathStage({
  topic,
  learningPath,
  currentStep,
  completedSteps,
  onStepClick,
  onContinueLearning,
}: LearningPathStageProps) {
  const progress = calculateProgress(completedSteps, learningPath.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Your Personalized Learning Journey</h2>
          <p className="text-gray-300 mb-4">Topic: <span className="text-teal-400 font-semibold">{topic}</span></p>

          {/* Progress Bar */}
          <div className="bg-gray-700 rounded-full h-3 max-w-md mx-auto mb-6">
            <div
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-400">{progress}% Complete</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-600"></div>

          {learningPath.map((step, index) => (
            <div key={step.id} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                <div
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border cursor-pointer transition-all duration-300 hover:scale-105 ${
                    completedSteps.has(index)
                      ? 'border-teal-400 bg-teal-500/20'
                      : index === currentStep
                        ? 'border-blue-400 bg-blue-500/20'
                        : index < currentStep
                          ? 'border-white/30 hover:border-white/50'
                          : 'border-gray-600 opacity-60'
                  }`}
                  onClick={() => onStepClick(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{step.thumbnail}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-gray-300 text-sm mb-3">{step.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm">{step.duration}</span>
                        </div>
                        {completedSteps.has(index) && (
                          <CheckCircle className="w-5 h-5 text-teal-400" />
                        )}
                        {index === currentStep && !completedSteps.has(index) && (
                          <Play className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline dot */}
              <div className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 ${
                completedSteps.has(index)
                  ? 'bg-teal-400 border-teal-400'
                  : index === currentStep
                    ? 'bg-blue-400 border-blue-400'
                    : 'bg-gray-600 border-gray-600'
              }`}></div>
            </div>
          ))}
        </div>

        {/* Continue Learning Button */}
        {completedSteps.size > 0 && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={onContinueLearning}
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
            >
              Continue Learning
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 