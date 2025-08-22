import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
  start: number;
}

export interface ProcessedTranscript {
  videoId: string;
  title?: string;
  duration?: number;
  segments: TranscriptSegment[];
  fullText: string;
  summary?: string;
  keyPoints?: string[];
  questions?: string[];
}

export interface TranscriptProcessingOptions {
  includeSummary?: boolean;
  includeKeyPoints?: boolean;
  includeQuestions?: boolean;
  maxSummaryLength?: number;
  keyPointsCount?: number;
  questionsCount?: number;
}

export class YouTubeTranscriptProcessor {
  private static instance: YouTubeTranscriptProcessor;

  private constructor() {}

  public static getInstance(): YouTubeTranscriptProcessor {
    if (!YouTubeTranscriptProcessor.instance) {
      YouTubeTranscriptProcessor.instance = new YouTubeTranscriptProcessor();
    }
    return YouTubeTranscriptProcessor.instance;
  }

  /**
   * Extract transcript from YouTube video
   */
  async extractTranscript(videoId: string): Promise<TranscriptSegment[]> {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      return transcript.map((item: any) => ({
        text: item.text,
        duration: item.duration,
        offset: item.offset,
        start: item.offset / 1000 // Convert to seconds
      }));
    } catch (error) {
      console.error('Error extracting transcript:', error);
      throw new Error(`Failed to extract transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process transcript into structured learning content
   */
  async processTranscript(
    videoId: string,
    options: TranscriptProcessingOptions = {}
  ): Promise<ProcessedTranscript> {
    const {
      includeSummary = true,
      includeKeyPoints = true,
      includeQuestions = true,
      maxSummaryLength = 200,
      keyPointsCount = 5,
      questionsCount = 3
    } = options;

    try {
      // Extract transcript
      const segments = await this.extractTranscript(videoId);
      
      // Combine all text
      const fullText = segments.map(segment => segment.text).join(' ');

      // Process the transcript
      const processed: ProcessedTranscript = {
        videoId,
        segments,
        fullText
      };

      // Generate summary if requested
      if (includeSummary) {
        processed.summary = await this.generateSummary(fullText, maxSummaryLength);
      }

      // Extract key points if requested
      if (includeKeyPoints) {
        processed.keyPoints = await this.extractKeyPoints(fullText, keyPointsCount);
      }

      // Generate questions if requested
      if (includeQuestions) {
        processed.questions = await this.generateQuestions(fullText, questionsCount);
      }

      return processed;
    } catch (error) {
      console.error('Error processing transcript:', error);
      throw new Error(`Failed to process transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a summary of the transcript
   */
  private async generateSummary(text: string, maxLength: number): Promise<string> {
    // Simple summary generation - you can enhance this with AI
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ') + '.';
    
    return summary.length > maxLength 
      ? summary.substring(0, maxLength) + '...'
      : summary;
  }

  /**
   * Extract key points from the transcript
   */
  private async extractKeyPoints(text: string, count: number): Promise<string[]> {
    // Simple key points extraction - you can enhance this with AI
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints = sentences
      .slice(0, count * 2) // Get more sentences to filter
      .filter(sentence => 
        sentence.toLowerCase().includes('important') ||
        sentence.toLowerCase().includes('key') ||
        sentence.toLowerCase().includes('main') ||
        sentence.toLowerCase().includes('primary') ||
        sentence.toLowerCase().includes('essential')
      )
      .slice(0, count);

    // If we don't have enough key points, add some general sentences
    if (keyPoints.length < count) {
      const remaining = sentences.slice(keyPoints.length, count);
      keyPoints.push(...remaining);
    }

    return keyPoints.map(point => point.trim() + '.');
  }

  /**
   * Generate questions based on the transcript
   */
  private async generateQuestions(text: string, count: number): Promise<string[]> {
    // Simple question generation - you can enhance this with AI
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const questions: string[] = [];

    // Generate different types of questions
    const questionTypes = [
      'What is the main topic discussed in this video?',
      'What are the key takeaways from this content?',
      'How does this information apply to real-world scenarios?',
      'What are the benefits mentioned in this video?',
      'What challenges or problems are addressed?'
    ];

    for (let i = 0; i < Math.min(count, questionTypes.length); i++) {
      questions.push(questionTypes[i]);
    }

    return questions;
  }

  /**
   * Get transcript segments by time range
   */
  getSegmentsByTimeRange(
    segments: TranscriptSegment[],
    startTime: number,
    endTime: number
  ): TranscriptSegment[] {
    return segments.filter(segment => 
      segment.start >= startTime && segment.start <= endTime
    );
  }

  /**
   * Search for specific terms in the transcript
   */
  searchTranscript(
    segments: TranscriptSegment[],
    searchTerm: string
  ): TranscriptSegment[] {
    const term = searchTerm.toLowerCase();
    return segments.filter(segment => 
      segment.text.toLowerCase().includes(term)
    );
  }

  /**
   * Convert transcript to markdown format
   */
  toMarkdown(processed: ProcessedTranscript): string {
    let markdown = `# Video Transcript\n\n`;
    
    if (processed.title) {
      markdown += `**Title:** ${processed.title}\n\n`;
    }
    
    if (processed.summary) {
      markdown += `## Summary\n\n${processed.summary}\n\n`;
    }
    
    if (processed.keyPoints && processed.keyPoints.length > 0) {
      markdown += `## Key Points\n\n`;
      processed.keyPoints.forEach(point => {
        markdown += `- ${point}\n`;
      });
      markdown += `\n`;
    }
    
    markdown += `## Full Transcript\n\n`;
    processed.segments.forEach(segment => {
      const timestamp = this.formatTimestamp(segment.start);
      markdown += `**[${timestamp}]** ${segment.text}\n\n`;
    });
    
    if (processed.questions && processed.questions.length > 0) {
      markdown += `## Questions for Review\n\n`;
      processed.questions.forEach((question, index) => {
        markdown += `${index + 1}. ${question}\n`;
      });
    }
    
    return markdown;
  }

  /**
   * Format timestamp in MM:SS format
   */
  private formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Export transcript to different formats
   */
  exportTranscript(processed: ProcessedTranscript, format: 'json' | 'markdown' | 'text'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(processed, null, 2);
      case 'markdown':
        return this.toMarkdown(processed);
      case 'text':
        return processed.fullText;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

// Convenience functions for easy usage
export const transcriptProcessor = YouTubeTranscriptProcessor.getInstance();

/**
 * Quick function to get transcript from YouTube URL
 */
export async function getTranscriptFromUrl(
  youtubeUrl: string,
  options?: TranscriptProcessingOptions
): Promise<ProcessedTranscript> {
  const { getYouTubeVideoId } = await import('./utils');
  const videoId = getYouTubeVideoId(youtubeUrl);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  return transcriptProcessor.processTranscript(videoId, options);
}

/**
 * Quick function to export transcript to file
 */
export async function exportTranscriptToFile(
  processed: ProcessedTranscript,
  format: 'json' | 'markdown' | 'text',
  filename?: string
): Promise<void> {
  const content = transcriptProcessor.exportTranscript(processed, format);
  const defaultFilename = `transcript-${processed.videoId}.${format}`;
  const finalFilename = filename || defaultFilename;
  
  // Create and download file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
