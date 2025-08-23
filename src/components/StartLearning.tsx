import { useYouTubeTranscript } from '@/hooks/useYouTubeTranscript';
import React from 'react';
import { useLearningState } from '../hooks/useLearningState';
import {
  AdaptiveStage,
  CompleteStage,
  InputStage,
  LearningPathStage,
  QuizStage,
  VideoStage,
} from './learning';

const LearnFlowAI = () => {
   // Process a YouTube video
   const { transcript, isLoading, processVideo } = useYouTubeTranscript();
     
   const handleProcess = async () => {
     await processVideo('https://youtu.be/5Wd-8gzw_PQ?si=OLx26I9AnNCdFbNF');
   };
   React.useEffect(()=>{
    handleProcess()
   },[])
   React.useEffect(()=>{
    console.log("transcript is",transcript);
   },[transcript])
  const {
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
  } = useLearningState();

  const handleTopicChange = (topic: string) => {
    updateState({ topic });
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    updateState({
      selectedAnswers: { ...state.selectedAnswers, [questionIndex]: answerIndex }
    });
  };

  const handleBackToPath = () => {
    updateState({ currentStage: 'learning-path' });
  };

  const handleStartExtraPractice = () => {
    updateState({ currentStage: 'learning-path' });
    handleQuizPass();
  };

  // Render appropriate stage
  const renderCurrentStage = () => {
    switch (state.currentStage) {
      case 'input':
        return (
          <InputStage
            topic={state.topic}
            onTopicChange={handleTopicChange}
            onStartLearning={handleStartLearning}
            loading={state.loading}
            error={state.error}
            inputRef={inputRef}
          />
        );
      case 'learning-path':
        return (
          <LearningPathStage
            topic={state.topic}
            learningPath={state.learningPath}
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            onStepClick={handleStepClick}
            onContinueLearning={handleContinueLearning}
          />
        );
      case 'video':
        return (
          <VideoStage
            currentStep={state.currentStep}
            learningPath={state.learningPath}
            videoLoading={state.videoLoading}
            videoError={state.videoError}
            videoData={state.videoData}
            onBackToPath={handleBackToPath}
            onVideoComplete={handleVideoComplete}
          />
        );
      case 'quiz':
        return (
          <QuizStage
            currentStep={state.currentStep}
            learningPath={state.learningPath}
            quizzes={state.quizzes}
            selectedAnswers={state.selectedAnswers}
            showResults={state.showResults}
            quizScore={state.quizScore}
            extractLoading={state.extractLoading}
            extractError={state.extractError}
            extractedContent={state.extractedContent}
            knowledgeCheckLoading={state.knowledgeCheckLoading}
            knowledgeCheckError={state.knowledgeCheckError}
            onAnswerSelect={handleAnswerSelect}
            onSubmit={handleQuizSubmit}
          />
        );
      case 'adaptive':
        return (
          <AdaptiveStage
            currentStep={state.currentStep}
            learningPath={state.learningPath}
            onStartExtraPractice={handleStartExtraPractice}
          />
        );
      case 'complete':
        return (
          <CompleteStage
            topic={state.topic}
            completedSteps={state.completedSteps}
            onReset={resetExperience}
          />
        );
      default:
        return (
          <InputStage
            topic={state.topic}
            onTopicChange={handleTopicChange}
            onStartLearning={handleStartLearning}
            loading={state.loading}
            error={state.error}
            inputRef={inputRef}
          />
        );
    }
  };

  return (
    <div className="font-sans">
      {renderCurrentStage()}
    </div>
  );
};

export default LearnFlowAI;