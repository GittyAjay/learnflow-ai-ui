// API service functions for learning functionality

export interface LearningPathStep {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  videoUrl: string;
  remedialLesson?: {
    id: string;
    title: string;
    duration: string;
    thumbnail: string;
    videoUrl: string;
    description: string;
  };
}

export interface VideoData {
  title: string;
  url: string;
  description: string;
}

export interface ExtractedYouTubeData {
  videoUrl: string;
  transcript: string;
  summary: string;
  topics: string[];
  wordCount: number;
  timestamp: string;
}

export interface LearningPathResponse {
  learningPath: LearningPathStep[];
  quizzes: Record<string, any>;
}

export interface KnowledgeCheckQuestion {
  type: 'mcq' | 'true_false' | 'short_answer';
  question: string;
  options: string[] | null;
  answer: string | boolean;
  explanation: string;
}

export interface KnowledgeCheckResponse {
  questions: KnowledgeCheckQuestion[];
  count: number;
  timestamp: string;
}

// Fetches learning path from new /learning-path endpoint
export async function fetchLearningPathAndQuizzes(topic: string): Promise<LearningPathResponse> {
  try {
    const response = await fetch('http://localhost:9000/api/learning-path', {
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
    let learningPathArr: LearningPathStep[] = [];
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
export async function fetchBestVideo(topic: string): Promise<VideoData> {
  try {
    const response = await fetch('http://localhost:9000/api/video-options', {
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
    console.log("fetchBestVideo1211",data);
    
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

// Updated extractYouTubeContent function using the new transcription endpoint
export async function extractYouTubeContent(videoUrl: string): Promise<ExtractedYouTubeData> {
  try {
    console.log("Starting extractYouTubeContent with URL:", videoUrl);
    
    const response = await fetch('https://f99baa4b8adf.ngrok-free.app/transcribe', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: videoUrl,
        whisper_model: "openai/whisper-base",
        output_format: "text",
        chunk_length_s: 30,
        include_timestamps: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to extract YouTube content: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Transcription response:", data);

    if (data && data.status === "success" && data.text) {
      // Extract basic topics from the transcript (simple keyword extraction)
      const topics = extractTopicsFromText(data.text);
      
      // Generate a simple summary (first 200 characters + "...")
      const summary = data.text.length > 200 
        ? data.text.substring(0, 200) + "..."
        : data.text;

      return {
        videoUrl: videoUrl,
        transcript: data.text,
        summary: summary,
        topics: topics,
        wordCount: data.text.split(' ').length,
        timestamp: new Date().toISOString()
      } as ExtractedYouTubeData;
    }
    
    throw new Error('No transcription data returned or transcription failed');
  } catch (error) {
    console.error('Error extracting YouTube content:', error);
    throw new Error(`Failed to extract or parse YouTube content: ${error.message}`);
  }
}

// Helper function to extract basic topics from transcript text
function extractTopicsFromText(text: string): string[] {
  // Simple topic extraction - you might want to use a more sophisticated approach
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4); // Only words longer than 4 characters
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Get top 5 most frequent words as topics
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)
    .filter(word => !['that', 'this', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word));
}

// Fetches knowledge check questions for a given transcript, summary, and topics
export async function fetchKnowledgeCheck(input: {
  transcript: string;
  summary: string;
  topics: string[];
}): Promise<KnowledgeCheckResponse> {
  try {
    const response = await fetch('http://localhost:9000/api/knowledge-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      // Handle different error status codes
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Failed to fetch knowledge check: ${errorMessage}`);
    }

    const data = await response.json();

    // The endpoint returns { success: true, questions: [...] }
    // NOT { success: true, data: {...} }
    if (data && data.success && data.questions) {
      return { questions: data.questions } as KnowledgeCheckResponse;
    }
    
    throw new Error('No knowledge check questions returned');
  } catch (error) {
    console.error('Error fetching knowledge check:', error);
    throw new Error('Failed to fetch or parse knowledge check from backend');
  }
}