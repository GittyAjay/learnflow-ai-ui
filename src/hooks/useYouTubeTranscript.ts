import { useState, useCallback } from 'react';
import { 
  transcriptProcessor, 
  getTranscriptFromUrl,
  exportTranscriptToFile,
  type ProcessedTranscript,
  type TranscriptProcessingOptions 
} from '../lib/youtube-transcript-processor';

export interface UseYouTubeTranscriptReturn {
  // State
  transcript: ProcessedTranscript | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  processVideo: (youtubeUrl: string, options?: TranscriptProcessingOptions) => Promise<void>;
  processVideoId: (videoId: string, options?: TranscriptProcessingOptions) => Promise<void>;
  exportTranscript: (format: 'json' | 'markdown' | 'text', filename?: string) => Promise<void>;
  clearTranscript: () => void;
  searchInTranscript: (searchTerm: string) => void;
  
  // Search results
  searchResults: ProcessedTranscript['segments'];
}

export function useYouTubeTranscript(): UseYouTubeTranscriptReturn {
  const [transcript, setTranscript] = useState<ProcessedTranscript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ProcessedTranscript['segments']>([]);

  const processVideo = useCallback(async (
    youtubeUrl: string, 
    options?: TranscriptProcessingOptions
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getTranscriptFromUrl(youtubeUrl, options);
      setTranscript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
      console.error('Error processing video:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processVideoId = useCallback(async (
    videoId: string, 
    options?: TranscriptProcessingOptions
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await transcriptProcessor.processTranscript(videoId, options);
      setTranscript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
      console.error('Error processing video:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportTranscript = useCallback(async (
    format: 'json' | 'markdown' | 'text',
    filename?: string
  ) => {
    if (!transcript) {
      setError('No transcript to export');
      return;
    }
    
    try {
      await exportTranscriptToFile(transcript, format, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export transcript');
      console.error('Error exporting transcript:', err);
    }
  }, [transcript]);

  const clearTranscript = useCallback(() => {
    setTranscript(null);
    setError(null);
    setSearchResults([]);
  }, []);

  const searchInTranscript = useCallback((searchTerm: string) => {
    if (!transcript) {
      setSearchResults([]);
      return;
    }
    
    const results = transcriptProcessor.searchTranscript(transcript.segments, searchTerm);
    setSearchResults(results);
  }, [transcript]);

  return {
    transcript,
    isLoading,
    error,
    processVideo,
    processVideoId,
    exportTranscript,
    clearTranscript,
    searchInTranscript,
    searchResults
  };
}
