import { Play } from 'lucide-react';
import React from 'react';
import YouTube from 'react-youtube';
import { LearningPathStep, VideoData } from '../../lib/api';
import { getYouTubeVideoId, isYouTubeUrl, validateVideoUrl } from '../../lib/utils';

interface VideoStageProps {
  currentStep: number;
  learningPath: LearningPathStep[];
  videoLoading: boolean;
  videoError: string | null;
  videoData: VideoData | null;
  extractLoading: boolean; // Added this prop
  onBackToPath: () => void;
  onVideoComplete: () => void;
}

export function VideoStage({
  currentStep,
  learningPath,
  videoLoading,
  videoError,
  videoData,
  extractLoading, // Added this prop
  onBackToPath,
  onVideoComplete,
}: VideoStageProps) {
  const [isVideoReady, setIsVideoReady] = React.useState(false);
  const [hasVideoEnded, setHasVideoEnded] = React.useState(false);
  const [isMarkingAsWatched, setIsMarkingAsWatched] = React.useState(false);

  // Get video ID and validate it more thoroughly
  const videoId = videoData?.url ? getYouTubeVideoId(videoData.url) : null;
  const isValidYouTubeVideo = videoData &&
    isYouTubeUrl(videoData.url) &&
    videoId &&
    videoId.trim().length > 0;

  // Get detailed validation info for debugging
  const videoValidation = videoData ? validateVideoUrl(videoData.url) : null;

  // Debug logging
  React.useEffect(() => {
    if (videoData?.url) {
      console.log('VideoStage Debug:', {
        url: videoData.url,
        videoId,
        isValidYouTubeVideo,
        validation: videoValidation
      });
    }
  }, [videoData, videoId, isValidYouTubeVideo, videoValidation]);

  // Handler for YouTube video end event
  const handleYouTubeEnd = () => {
    setHasVideoEnded(true);
    handleVideoCompletion();
  };

  // Handler for native video end event
  const handleNativeVideoEnd = () => {
    setHasVideoEnded(true);
    handleVideoCompletion();
  };

  // Handler for YouTube video ready event
  const handleYouTubeReady = () => {
    setIsVideoReady(true);
    console.log('YouTube player ready for video:', videoId);
  };

  // Handler for manual completion (Mark as Watched button)
  const handleManualComplete = () => {
    setIsMarkingAsWatched(true);
    handleVideoCompletion();
  };

  // Handle video completion with loading state
  const handleVideoCompletion = () => {
    setHasVideoEnded(true);
    onVideoComplete();
  };

  // Reset video state when video data changes
  React.useEffect(() => {
    setIsVideoReady(false);
    setHasVideoEnded(false);
    setIsMarkingAsWatched(false);
  }, [videoData]);

  // Show loading when extractLoading is true (video processing)
  React.useEffect(() => {
    if (extractLoading) {
      setIsMarkingAsWatched(true);
    }
  }, [extractLoading]);

  // Helper: Render the video player (YouTube or direct video)
  function renderVideoPlayer() {
    if (isValidYouTubeVideo && videoId) {
      return (
        <YouTube
          videoId={videoId}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1,
              controls: 1, // Show controls for better UX
              modestbranding: 1,
              rel: 0,
            },
          }}
          className="rounded-lg aspect-video bg-black w-full"
          onReady={handleYouTubeReady}
          onEnd={handleYouTubeEnd}
          onError={(error) => {
            console.error('YouTube player error:', error);
            setIsVideoReady(false);
          }}
        />
      );
    } else if (
      videoData &&
      videoData.url &&
      videoValidation?.type === 'direct'
    ) {
      // Direct video file (mp4, webm, etc.)
      return (
        <video
          src={videoData.url}
          controls
          autoPlay
          className="rounded-lg aspect-video bg-black w-full object-contain"
          onEnded={handleNativeVideoEnd}
          onCanPlay={() => setIsVideoReady(true)}
          onError={() => setIsVideoReady(false)}
        >
          Sorry, your browser doesn't support embedded videos.
        </video>
      );
    } else {
      // Not a valid video - show placeholder with better styling
      return (
        <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
          <div className="text-center px-6 py-8">
            <div className="text-6xl mb-6 drop-shadow-lg">{learningPath[currentStep]?.thumbnail}</div>
            <h3 className="text-2xl font-bold mb-3 leading-tight text-white drop-shadow-md">{learningPath[currentStep]?.title}</h3>
            <p className="text-gray-200 mb-6 max-w-2xl leading-relaxed drop-shadow-sm">{learningPath[currentStep]?.description}</p>
            <p className="text-gray-300 mb-2 text-lg font-semibold">Video not available</p>
            <p className="text-gray-500 text-sm mb-1">
              {videoValidation?.error || 'Invalid or unsupported video URL'}
            </p>
            {process.env.NODE_ENV === 'development' && videoData?.url && (
              <p className="text-gray-600 text-xs mt-1 break-all">
                URL: {videoData.url}
              </p>
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">
              {learningPath[currentStep]?.title}
            </h2>
            <p className="text-teal-300 font-medium">
              Step {currentStep + 1} of {learningPath.length}
            </p>
          </div>
          <button
            onClick={onBackToPath}
            disabled={isMarkingAsWatched}
            className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/60 shadow hover:bg-gray-700/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to Path
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black/80 rounded-2xl overflow-hidden mb-4 shadow-lg border border-gray-800">
              {videoLoading ? (
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400 mb-3 block mx-auto"></span>
                    <span className="text-teal-200 text-lg font-medium">Finding the best video...</span>
                  </div>
                </div>
              ) : videoError ? (
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-red-400 mb-4 text-lg font-semibold">{videoError}</div>
                    <button
                      onClick={handleManualComplete}
                      disabled={isMarkingAsWatched}
                      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMarkingAsWatched ? 'Processing...' : 'Continue Anyway'}
                    </button>
                  </div>
                </div>
              ) : videoData ? (
                <div className="flex flex-col">
                  {/* Video Player - Prioritized First */}
                  <div className="w-full">
                    {renderVideoPlayer()}
                  </div>
                  
                  {/* Video Info and Buttons */}
                  <div className="p-6 bg-gray-900/50">
                    <div className="w-full flex flex-col items-center">
                      <p className="text-gray-200 text-base mb-4 mt-2 max-w-2xl text-center leading-relaxed">{videoData.description}</p>
                      
                      {/* Show loading indicator while video is loading */}
                      {!isVideoReady && !hasVideoEnded && (
                        <div className="flex items-center justify-center mb-4">
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-400 mr-2"></span>
                          <span className="text-teal-200 text-sm">Loading video...</span>
                        </div>
                      )}
                      
                      {/* Show processing indicator when marking as watched */}
                      {isMarkingAsWatched && (
                        <div className="flex items-center justify-center mb-4 bg-blue-900/20 px-4 py-2 rounded-lg">
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                          <span className="text-white text-sm">Processing video content...</span>
                        </div>
                      )}
                      
                      {/* Show "Mark as Watched" button for all video types */}
                      <button
                        onClick={handleManualComplete}
                        disabled={hasVideoEnded || isMarkingAsWatched}
                        className={`mt-2 font-semibold py-3 px-8 rounded-lg transition-colors flex items-center mx-auto shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasVideoEnded || isMarkingAsWatched
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isMarkingAsWatched ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            Processing...
                          </>
                        ) : hasVideoEnded ? (
                          'Video Completed'
                        ) : (
                          'Mark as Watched'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white px-6 py-8">
                    <div className="text-6xl mb-6 drop-shadow-lg">{learningPath[currentStep]?.thumbnail}</div>
                    <h3 className="text-2xl font-bold mb-3 leading-tight text-white drop-shadow-md">{learningPath[currentStep]?.title}</h3>
                    <p className="text-gray-200 mb-6 max-w-2xl leading-relaxed drop-shadow-sm">{learningPath[currentStep]?.description}</p>
                    <button
                      disabled
                      className="bg-teal-500 text-white font-semibold py-3 px-8 rounded-lg opacity-50 flex items-center mx-auto shadow-lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Video ({learningPath[currentStep]?.duration})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Topics Sidebar */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-7 border border-white/10 shadow-lg">
            <h3 className="text-white font-semibold text-xl mb-5 tracking-wide">Upcoming Topics</h3>
            <div className="space-y-4">
              {learningPath.slice(currentStep + 1, currentStep + 4).map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  <div className="text-3xl">{step.thumbnail}</div>
                  <div className="flex-1">
                    <p className="text-white text-base font-semibold">{step.title}</p>
                    <p className="text-gray-300 text-xs">{step.duration}</p>
                  </div>
                </div>
              ))}
              {learningPath.length <= currentStep + 1 && (
                <div className="text-gray-400 text-center py-6 text-sm">
                  No more upcoming topics.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}