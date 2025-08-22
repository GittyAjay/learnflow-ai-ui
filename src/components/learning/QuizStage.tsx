import { LearningPathStep, type ExtractedYouTubeData, type KnowledgeCheckQuestion } from '../../lib/api';

interface QuizStageProps {
  currentStep: number;
  learningPath: LearningPathStep[];
  quizzes: Record<string, { questions: { question: string; options: string[]; correct: number; explanation?: string; type?: string }[] }>;
  selectedAnswers: { [key: number]: number };
  showResults: boolean;
  quizScore: number | null;
  extractLoading: boolean;
  extractError: string | null;
  extractedContent: ExtractedYouTubeData | null;
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  onSubmit: () => void;
}

// The quizzes prop is now expected to already be in the correct format: { questions: [{question, options, correct, ...}] }
export function QuizStage({
  currentStep,
  learningPath,
  quizzes,
  selectedAnswers,
  showResults,
  quizScore,
  extractLoading,
  extractError,
  extractedContent,
  onAnswerSelect,
  onSubmit,
}: QuizStageProps) {
  const stepId = learningPath[currentStep]?.id;
  const currentQuiz = quizzes[stepId];
  const questions = currentQuiz?.questions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Knowledge Check</h2>
            <p className="text-gray-300">Test your understanding of {learningPath[currentStep]?.title}</p>
          </div>

          {!showResults ? (
            <div className="space-y-6">
              {/* Extracted context from watched video */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3">Context from the video</h3>
                {extractLoading && (
                  <p className="text-gray-300">Extracting summary and topics from the video...</p>
                )}
                {!extractLoading && extractError && (
                  <p className="text-red-300">{extractError}</p>
                )}
                {!extractLoading && !extractError && extractedContent && (
                  <div className="text-gray-200 space-y-3">
                    <p className="whitespace-pre-wrap">{extractedContent.summary}</p>
                    {extractedContent.topics && extractedContent.topics.length > 0 && (
                      <div>
                        <p className="text-gray-300 mt-2 mb-1 font-medium">Topics:</p>
                        <ul className="list-disc list-inside text-gray-200">
                          {extractedContent.topics.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {questions.length === 0 && (
                <div className="bg-white/5 rounded-xl p-6 text-gray-300 text-center">
                  No quiz questions available for this step.
                </div>
              )}

              {questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">
                    {qIndex + 1}. {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option: string, oIndex: number) => (
                      <button
                        key={oIndex}
                        onClick={() => onAnswerSelect(qIndex, oIndex)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          selectedAnswers[qIndex] === oIndex
                            ? 'bg-teal-500/30 border border-teal-400 text-white'
                            : 'bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={onSubmit}
                disabled={questions.length === 0 || Object.keys(selectedAnswers).length < questions.length}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:from-teal-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check My Answers
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className={`text-6xl mb-4 ${quizScore && quizScore >= 70 ? 'text-teal-400' : 'text-orange-400'}`}>
                {quizScore && quizScore >= 70 ? '🎉' : '📚'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Score: {quizScore}%
              </h3>
              <p className="text-gray-300 mb-6">
                {quizScore && quizScore >= 70
                  ? "Great job! You're ready for the next topic."
                  : "Let's add some extra practice to strengthen your understanding."}
              </p>

              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                <span className="ml-3 text-gray-300">Preparing your next step...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}