import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for video and URL handling

// Helper: Extract YouTube video ID from URL
export function getYouTubeVideoId(url: string): string | null {
  // Handles URLs like https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  try {
    const parsed = new URL(url);
    
    // Handle youtu.be URLs
    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      // Return the video ID if it exists, regardless of length
      return videoId || null;
    }
    
    // Handle youtube.com URLs
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      // Return the video ID if it exists, regardless of length
      return videoId || null;
    }
    
    return null;
  } catch (error) {
    console.warn("Failed to parse YouTube URL:", url, error);
    return null;
  }
}

// Helper: Check if URL is a YouTube link
export function isYouTubeUrl(url: string): boolean {
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
export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(url);
}

// Helper: Validate video URL and return detailed information
export function validateVideoUrl(url: string): {
  isValid: boolean;
  type: 'youtube' | 'direct' | 'unknown';
  videoId?: string;
  error?: string;
} {
  if (!url || typeof url !== 'string') {
    return { isValid: false, type: 'unknown', error: 'No URL provided' };
  }

  try {
    // Check if it's a YouTube URL
    if (isYouTubeUrl(url)) {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        return { isValid: true, type: 'youtube', videoId };
      } else {
        return { isValid: false, type: 'youtube', error: 'Invalid YouTube video ID' };
      }
    }

    // Check if it's a direct video file
    if (isDirectVideoUrl(url)) {
      return { isValid: true, type: 'direct' };
    }

    // Try to parse as URL
    new URL(url);
    return { isValid: false, type: 'unknown', error: 'Unsupported video URL format' };
  } catch (error) {
    return { isValid: false, type: 'unknown', error: 'Invalid URL format' };
  }
}

// Calculate progress percentage based on completed steps
export function calculateProgress(completedSteps: Set<number>, totalSteps: number): number {
  return totalSteps > 0 ? Math.round((completedSteps.size / totalSteps) * 100) : 0;
}
