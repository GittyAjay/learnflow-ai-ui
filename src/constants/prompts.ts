const LEARNING_PATH_GENERATE = (topic) => `
You are an AI tutor. Your job is to generate a structured learning path for the topic: "${topic}".

### Instructions:
1. Break "${topic}" into 5–7 progressive lessons (beginner → intermediate → advanced).
2. Each lesson should include:
   - "id": sequential number starting at 1
   - "title": a clear, concise lesson name
   - "duration": short learning time (e.g., "12 min", "20 min")
   - "thumbnail": use an emoji that best represents the lesson
   - "videoUrl": placeholder "#" (always)
   - "description": short 1-line beginner-friendly explanation
3. Return the result inside a **JavaScript object** exactly in this format:

const learningPaths = {
  "${topic.toLowerCase()}": [
    { id: 1, title: "Lesson Title", duration: "XX min", thumbnail: "🎯", videoUrl: "#", description: "One-line explanation" },
    { id: 2, title: "Lesson Title", duration: "XX min", thumbnail: "📘", videoUrl: "#", description: "One-line explanation" }
  ]
};

### Example Input:
Topic: "Web Development"

### Example Output:
const learningPaths = {
  "web development": [
    { id: 1, title: "HTML Structure & Semantics", duration: "14 min", thumbnail: "🏗️", videoUrl: "#", description: "Build webpage structure with HTML" },
    { id: 2, title: "CSS Styling & Layouts", duration: "18 min", thumbnail: "🎨", videoUrl: "#", description: "Style and layout your web pages" },
    { id: 3, title: "JavaScript Fundamentals", duration: "20 min", thumbnail: "⚡", videoUrl: "#", description: "Add interactivity with JavaScript" },
    { id: 4, title: "DOM Manipulation", duration: "16 min", thumbnail: "🔧", videoUrl: "#", description: "Dynamically modify web page content" },
    { id: 5, title: "Responsive Design", duration: "12 min", thumbnail: "📱", videoUrl: "#", description: "Make websites work on all devices" },
    { id: 6, title: "Modern Frameworks Introduction", duration: "25 min", thumbnail: "⚛️", videoUrl: "#", description: "Get started with React or Vue.js" }
  ]
};

Now generate the learning path for "${topic}".
`;
