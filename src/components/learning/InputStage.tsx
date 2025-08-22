import { Brain } from 'lucide-react';
import { RefObject } from 'react';

interface InputStageProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  onStartLearning: () => void;
  loading: boolean;
  error: string | null;
  inputRef: RefObject<HTMLInputElement>;
}

export function InputStage({ 
  topic, 
  onTopicChange, 
  onStartLearning, 
  loading, 
  error, 
  inputRef 
}: InputStageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-16 h-16 text-teal-400 mr-4" />
            <h1 className="text-5xl font-bold text-white">LearnFlow AI</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8">Personalized learning paths powered by AI</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <input
            ref={inputRef}
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="What do you want to learn today? (e.g., Python for Data Science, Web Development, Machine Learning...)"
            className="w-full p-4 text-lg rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 mb-6"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onStartLearning();
              }
            }}
            autoFocus
            disabled={loading}
          />

          <button
            onClick={onStartLearning}
            disabled={!topic.trim() || loading}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:from-teal-400 hover:to-blue-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-400 mr-2"></span>
                Building Path...
              </span>
            ) : (
              'Build My Learning Path'
            )}
          </button>

          {error && (
            <div className="mt-4 text-red-400 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-center mt-6 text-gray-400">
            <Brain className="w-5 h-5 mr-2" />
            <span>Powered by LearnFlow AI</span>
          </div>
        </div>
      </div>
    </div>
  );
} 