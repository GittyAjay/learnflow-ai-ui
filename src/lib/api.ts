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

export interface LearningPathResponse {
  learningPath: LearningPathStep[];
  quizzes: Record<string, any>;
}

// Fetches learning path from new /learning-path endpoint
export async function fetchLearningPathAndQuizzes(topic: string): Promise<LearningPathResponse> {
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