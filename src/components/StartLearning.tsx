
import { ArrowRight, Award, Brain, CheckCircle, Clock, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
// import ReactPlayer from 'react-player';
import YouTube from 'react-youtube';

// Fetches learning path from new /learning-path endpoint
export async function fetchLearningPathAndQuizzes(topic: string) {
  try {
    const response = await fetch('http://localhost:9000/api/learning-routes/learning-path', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch learning path from backend');
    }

    const data = await response.json();
    // The API returns { success, data: [...] }
    let learningPathArr: any[] = [];
    if (data && data.success && Array.isArray(data.data)) {
      // Map to the expected format for the rest of the app
      learningPathArr = data.data.map((step: any, idx: number) => ({
        id: idx + 1,
        title: step.title,
        description: step.description,
        thumbnail: step.emoji,
        duration: step.timeToComplete,
        videoUrl: "#"
      }));
    }

    // quizzes are not provided by this endpoint, so return empty object
    return {
      learningPath: learningPathArr,
      quizzes: {}
    };
  } catch (error) {
    console.error("Error fetching learning path:", error);
    throw new Error("Failed to fetch or parse learning path from backend");
  }
}

// Fetches the best video for a given topic/step
export async function fetchBestVideo(topic: string) {
  try {
    const response = await fetch('http://localhost:9000/api/learning-routes/best-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch best video from backend');
    }

    const data = await response.json();
    // The API returns { success, data: { title, url, description } }
    if (data && data.success && data.data) {
      return data.data;
    }
    throw new Error('No video data returned');
  } catch (error) {
    console.error("Error fetching best video:", error);
    throw new Error("Failed to fetch or parse best video from backend");
  }
}

// Helper: Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  // Handles URLs like https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

// Helper: Check if URL is a YouTube link
function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "youtu.be" ||
      parsed.hostname.endsWith("youtube.com")
    );
  } catch {
    return false;
  }
}

// Helper: Check if URL is a direct video file
function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(url);
}

const LearnFlowAI = () => {
  const [currentStage, setCurrentStage] = useState('input'); // input, learning-path, video, quiz, adaptive
  const [topic, setTopic] = useState('');
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [adaptiveInserts, setAdaptiveInserts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video state
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<{ title: string; url: string; description: string } | null>(null);

  // Ref for input focus
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when returning to input stage
  useEffect(() => {
    if (currentStage === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStage]);

  // Fetch learning path and quizzes from backend
  const handleStartLearning = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLearningPathAndQuizzes(topic);
      setLearningPath(data.learningPath || []);
      setQuizzes(data.quizzes || {});
      setCurrentStage('learning-path');
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setAdaptiveInserts([]);
    } catch (err: any) {
      setError('Failed to load learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // When a step is clicked, fetch the best video for that step and go to video stage
  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
      setCurrentStage('video');
      setVideoLoading(true);
      setVideoError(null);
      setVideoData(null);
      try {
        // Use the step's title as the topic for best video
        const step = learningPath[stepIndex];
        const video = await fetchBestVideo(step?.title || topic);
        setVideoData(video);
      } catch (err: any) {
        setVideoError('Failed to load video. Please try again.');
      } finally {
        setVideoLoading(false);
      }
    }
  };

  // When continuing learning, fetch the best video for the current step
  const handleContinueLearning = async () => {
    setCurrentStage('video');
    setVideoLoading(true);
    setVideoError(null);
    setVideoData(null);
    try {
      const step = learningPath[currentStep];
      const video = await fetchBestVideo(step?.title || topic);
      setVideoData(video);
    } catch (err: any) {
      setVideoError('Failed to load video. Please try again.');
    } finally {
      setVideoLoading(false);
    }
  };

  // When entering video stage directly (e.g., after quiz/adaptive), fetch video if not already loaded
  useEffect(() => {
    if (currentStage === 'video' && !videoData && learningPath.length > 0) {
      setVideoLoading(true);
      setVideoError(null);
      setVideoData(null);
      fetchBestVideo(learningPath[currentStep]?.title || topic)
        .then((video) => setVideoData(video))
        .catch(() => setVideoError('Failed to load video. Please try again.'))
        .finally(() => setVideoLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStage, currentStep, learningPath.length]);

  const handleVideoComplete = () => {
    setCurrentStage('quiz');
    setSelectedAnswers({});
    setShowResults(false);
    setQuizScore(null);
    setVideoData(null);
    setVideoError(null);
    setVideoLoading(false);
  };

  const handleQuizSubmit = () => {
    const currentQuiz = quizzes[learningPath[currentStep]?.id] || { questions: [] };
    let correct = 0;

    currentQuiz.questions.forEach((q: any, index: number) => {
      if (selectedAnswers[index] === q.correct) {
        correct++;
      }
    });

    const score = currentQuiz.questions.length > 0
      ? (correct / currentQuiz.questions.length) * 100
      : 0;
    setQuizScore(score);
    setShowResults(true);

    // Simulate adaptive learning
    setTimeout(() => {
      if (score < 70) {
        // Insert remedial content
        handleAdaptiveInsert();
      } else {
        // Move to next step
        handleQuizPass();
      }
    }, 2000);
  };

  const handleAdaptiveInsert = () => {
    // Use backend-provided remedial lesson if available, else fallback
    const remedialLesson =
      (learningPath[currentStep]?.remedialLesson) ||
      {
        id: `remedial-${currentStep}`,
        title: `Extra Practice: ${learningPath[currentStep]?.title || ''}`,
        duration: '8 min',
        thumbnail: '🔄',
        videoUrl: '#',
        description: 'Additional practice to strengthen understanding'
      };

    setAdaptiveInserts([...adaptiveInserts, { step: currentStep, lesson: remedialLesson }]);
    setCurrentStage('adaptive');
  };

  const handleQuizPass = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);

    if (currentStep < learningPath.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentStage('learning-path');
    } else {
      // Course complete
      setCurrentStage('complete');
    }
  };

  const calculateProgress = () => {
    return learningPath.length > 0
      ? Math.round((completedSteps.size / learningPath.length) * 100)
      : 0;
  };

  const resetExperience = () => {
    setCurrentStage('input');
    setTopic('');
    setLearningPath([]);
    setQuizzes({});
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setAdaptiveInserts([]);
    setError(null);
    setVideoData(null);
    setVideoError(null);
    setVideoLoading(false);
  };

  // Input Stage Component
  const InputStage = () => (
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
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to learn today? (e.g., Python for Data Science, Web Development, Machine Learning...)"
            className="w-full p-4 text-lg rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 mb-6"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleStartLearning();
              }
            }}
            autoFocus
            disabled={loading}
          />

          <button
            onClick={handleStartLearning}
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

  // Learning Path Timeline Component
  const LearningPathStage = () => (
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
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <p className="text-gray-400">{calculateProgress()}% Complete</p>
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
                  onClick={() => handleStepClick(index)}
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
              onClick={handleContinueLearning}
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

  // Video Player Stage Component
  const VideoStage = () => (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{learningPath[currentStep]?.title}</h2>
            <p className="text-gray-400">Step {currentStep + 1} of {learningPath.length}</p>
          </div>
          <button
            onClick={() => setCurrentStage('learning-path')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to Path
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden mb-4">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white w-full h-full flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4">{learningPath[currentStep]?.thumbnail}</div>
                  <h3 className="text-xl font-semibold mb-2">{learningPath[currentStep]?.title}</h3>
                  <p className="text-gray-400 mb-4">{learningPath[currentStep]?.description}</p>
                  {videoLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mb-2"></span>
                      <span className="text-gray-300">Finding the best video...</span>
                    </div>
                  ) : videoError ? (
                    <div className="text-red-400 mb-4">{videoError}</div>
                  ) : videoData ? (
                    <div className="flex flex-col items-center w-full">
                      {/* Inline Video Player */}
                      <div className="w-full flex flex-col items-center">
                        <YouTube
                          videoId={getYouTubeVideoId(videoData.url)}
                          opts={{
                            width: '100%',
                            height: '360',
                            playerVars: {
                              autoplay: 1,
                              controls: 0, // Hide YouTube controls
                            },
                          }}
                          className="rounded-lg mb-3 aspect-video bg-black"
                          onReady={() => {}}
                        />
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{videoData.description}</p>
                      <button
                        onClick={handleVideoComplete}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center mx-auto"
                      >
                        Mark as Watched
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled
                      className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-lg opacity-50 flex items-center mx-auto"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Video ({learningPath[currentStep]?.duration})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Topics Sidebar */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">Upcoming Topics</h3>
            <div className="space-y-3">
              {learningPath.slice(currentStep + 1, currentStep + 4).map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl">{step.thumbnail}</div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{step.title}</p>
                    <p className="text-gray-400 text-xs">{step.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Quiz Stage Component
  const QuizStage = () => {
    const currentQuiz = quizzes[learningPath[currentStep]?.id] || { questions: [] };

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
                {currentQuiz.questions.map((question: any, qIndex: number) => (
                  <div key={qIndex} className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option: string, oIndex: number) => (
                        <button
                          key={oIndex}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIndex]: oIndex })}
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
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length < currentQuiz.questions.length}
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
  };

  // Adaptive Insert Stage
  const AdaptiveStage = () => {
    const remedialLesson =
      (learningPath[currentStep]?.remedialLesson) ||
      {
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
              onClick={() => {
                setCurrentStage('learning-path');
                handleQuizPass();
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:from-orange-400 hover:to-red-400"
            >
              Start Extra Practice
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Course Complete Stage
  const CompleteStage = () => (
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
            onClick={resetExperience}
            className="bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:from-teal-400 hover:to-green-400 flex items-center mx-auto"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Start New Learning Journey
          </button>
        </div>
      </div>
    </div>
  );

  // Render appropriate stage
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'input':
        return <InputStage />;
      case 'learning-path':
        return <LearningPathStage />;
      case 'video':
        return <VideoStage />;
      case 'quiz':
        return <QuizStage />;
      case 'adaptive':
        return <AdaptiveStage />;
      case 'complete':
        return <CompleteStage />;
      default:
        return <InputStage />;
    }
  };

  return (
    <div className="font-sans">
      {renderCurrentStage()}
    </div>
  );
};

export default LearnFlowAI;