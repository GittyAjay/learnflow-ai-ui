import { useEffect, useRef, useState } from 'react';
import {
  extractYouTubeContent,
  fetchBestVideo,
  fetchLearningPathAndQuizzes,
  fetchKnowledgeCheck,
  LearningPathStep,
  VideoData,
  type ExtractedYouTubeData,
  type KnowledgeCheckQuestion,
  type KnowledgeCheckResponse
} from '../lib/api';

export interface LearningState {
  currentStage: 'input' | 'learning-path' | 'video' | 'quiz' | 'adaptive' | 'complete';
  topic: string;
  learningPath: LearningPathStep[];
  quizzes: Record<string, any>;
  currentStep: number;
  completedSteps: Set<number>;
  quizScore: number | null;
  selectedAnswers: { [key: number]: number };
  showResults: boolean;
  adaptiveInserts: any[];
  loading: boolean;
  error: string | null;
  videoLoading: boolean;
  videoError: string | null;
  videoData: VideoData | null;
  extractLoading: boolean;
  extractError: string | null;
  extractedContent: ExtractedYouTubeData | null;
}

export function useLearningState() {
  const [state, setState] = useState<LearningState>({
    currentStage: 'input',
    topic: '',
    learningPath: [],
    quizzes: {},
    currentStep: 0,
    completedSteps: new Set(),
    quizScore: null,
    selectedAnswers: {},
    showResults: false,
    adaptiveInserts: [],
    loading: false,
    error: null,
    videoLoading: false,
    videoError: null,
    videoData: null,
    extractLoading: false,
    extractError: null,
    extractedContent: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when returning to input stage
  useEffect(() => {
    if (state.currentStage === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.currentStage]);

  // When entering video stage directly, fetch video if not already loaded
  useEffect(() => {
    if (state.currentStage === 'video' && !state.videoData && state.learningPath.length > 0) {
      setState(prev => ({ ...prev, videoLoading: true, videoError: null, videoData: null }));

      fetchBestVideo(state.learningPath[state.currentStep]?.title || state.topic)
        .then((video) => setState(prev => ({ ...prev, videoData: video, videoLoading: false })))
        .catch(() => setState(prev => ({
          ...prev,
          videoError: 'Failed to load video. Please try again.',
          videoLoading: false
        })));
    }
  }, [state.currentStage, state.currentStep, state.learningPath.length, state.topic]);

  const updateState = (updates: Partial<LearningState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleStartLearning = async () => {
    if (!state.topic.trim()) return;

    updateState({ loading: true, error: null });

    try {
      const data = await fetchLearningPathAndQuizzes(state.topic);
      updateState({
        learningPath: data.learningPath || [],
        quizzes: data.quizzes || {},
        currentStage: 'learning-path',
        currentStep: 0,
        completedSteps: new Set(),
        adaptiveInserts: [],
        loading: false,
      });
    } catch (err: any) {
      updateState({
        error: 'Failed to load learning path. Please try again.',
        loading: false
      });
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex <= state.currentStep || state.completedSteps.has(stepIndex)) {
      updateState({
        currentStep: stepIndex,
        currentStage: 'video',
        videoLoading: true,
        videoError: null,
        videoData: null
      });

      try {
        const step = state.learningPath[stepIndex];
        const video = await fetchBestVideo(step?.title || state.topic);
        updateState({ videoData: video, videoLoading: false });
      } catch (err: any) {
        updateState({
          videoError: 'Failed to load video. Please try again.',
          videoLoading: false
        });
      }
    }
  };

  const handleContinueLearning = async () => {
    updateState({
      currentStage: 'video',
      videoLoading: true,
      videoError: null,
      videoData: null
    });

    try {
      const step = state.learningPath[state.currentStep];
      const video = await fetchBestVideo(step?.title || state.topic);
      updateState({ videoData: video, videoLoading: false });
    } catch (err: any) {
      updateState({
        videoError: 'Failed to load video. Please try again.',
        videoLoading: false
      });
    }
  };

  // Modified handleVideoComplete to extract, then fetch knowledge check, then update quizzes
  const handleVideoComplete = async () => {
    const videoUrl = state.videoData?.url;
    const stepId = state.learningPath[state.currentStep]?.id;
    if (videoUrl && stepId !== undefined) {
      updateState({ extractLoading: true, extractError: null });

      try {
        const extracted = await extractYouTubeContent(videoUrl);
        updateState({ extractedContent: extracted, extractLoading: false });

        // Fetch knowledge check using extracted content
        const knowledgeCheck: KnowledgeCheckResponse = await fetchKnowledgeCheck({
          transcript: extracted.transcript,
          summary: extracted.summary,
          topics: extracted.topics,
        });

        // Map backend questions to quiz format
        const mappedQuestions = (knowledgeCheck.questions || []).map((q: KnowledgeCheckQuestion) => {
          let options: string[] = [];
          let correct = 0;

          if (q.type === 'mcq') {
            options = Array.isArray(q.options) && q.options.length > 0
              ? q.options
              : typeof q.answer === 'string' ? [q.answer] : [];
            if (typeof q.answer === 'string' && options.length > 0) {
              const idx = options.findIndex(opt => opt.trim() === q.answer.toString().trim());
              correct = idx >= 0 ? idx : 0;
            } else {
              correct = 0;
            }
          } else if (q.type === 'true_false') {
            options = ['True', 'False'];
            if (typeof q.answer === 'boolean') {
              correct = q.answer === true ? 0 : 1;
            } else if (typeof q.answer === 'string') {
              correct = q.answer.toLowerCase() === 'true' ? 0 : 1;
            } else {
              correct = 0;
            }
          } else if (q.type === 'short_answer') {
            options = typeof q.answer === 'string' ? [q.answer] : [];
            correct = 0;
          } else {
            // fallback for unknown type
            options = typeof q.answer === 'string' ? [q.answer] : [];
            correct = 0;
          }

          return {
            question: q.question,
            options,
            correct,
            explanation: q.explanation,
            type: q.type,
          };
        });

        // Update quizzes state immutably for this stepId
        setState(prev => ({
          ...prev,
          quizzes: {
            ...prev.quizzes,
            [stepId]: { questions: mappedQuestions }
          }
        }));
      } catch (err) {
        updateState({
          extractError: 'Failed to extract video content or fetch quiz questions',
          extractLoading: false
        });
      }
    }

    updateState({
      currentStage: 'quiz',
      selectedAnswers: {},
      showResults: false,
      quizScore: null,
      videoData: null,
      videoError: null,
      videoLoading: false,
    });
  };

  const handleQuizSubmit = () => {
    const currentQuiz = state.quizzes[state.learningPath[state.currentStep]?.id] || { questions: [] };
    let correct = 0;

    currentQuiz.questions.forEach((q: any, index: number) => {
      if (state.selectedAnswers[index] === q.correct) {
        correct++;
      }
    });

    const score = currentQuiz.questions.length > 0
      ? (correct / currentQuiz.questions.length) * 100
      : 0;

    updateState({ quizScore: score, showResults: true });

    // Simulate adaptive learning
    setTimeout(() => {
      if (score < 70) {
        handleAdaptiveInsert();
      } else {
        handleQuizPass();
      }
    }, 2000);
  };

  const handleAdaptiveInsert = () => {
    const remedialLesson = (state.learningPath[state.currentStep]?.remedialLesson) || {
      id: `remedial-${state.currentStep}`,
      title: `Extra Practice: ${state.learningPath[state.currentStep]?.title || ''}`,
      duration: '8 min',
      thumbnail: '🔄',
      videoUrl: '#',
      description: 'Additional practice to strengthen understanding'
    };

    updateState({
      adaptiveInserts: [...state.adaptiveInserts, { step: state.currentStep, lesson: remedialLesson }],
      currentStage: 'adaptive'
    });
  };

  const handleQuizPass = () => {
    const newCompleted = new Set(state.completedSteps);
    newCompleted.add(state.currentStep);

    updateState({ completedSteps: newCompleted });

    if (state.currentStep < state.learningPath.length - 1) {
      updateState({
        currentStep: state.currentStep + 1,
        currentStage: 'learning-path'
      });
    } else {
      updateState({ currentStage: 'complete' });
    }
  };

  const resetExperience = () => {
    setState({
      currentStage: 'input',
      topic: '',
      learningPath: [],
      quizzes: {},
      currentStep: 0,
      completedSteps: new Set(),
      adaptiveInserts: [],
      error: null,
      videoData: null,
      videoError: null,
      videoLoading: false,
      loading: false,
      quizScore: null,
      selectedAnswers: {},
      showResults: false,
      extractLoading: false,
      extractError: null,
      extractedContent: null,
    });
  };

  return {
    state,
    inputRef,
    updateState,
    handleStartLearning,
    handleStepClick,
    handleContinueLearning,
    handleVideoComplete,
    handleQuizSubmit,
    handleAdaptiveInsert,
    handleQuizPass,
    resetExperience,
  };
}