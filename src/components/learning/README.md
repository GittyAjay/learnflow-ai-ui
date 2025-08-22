# Learning Components

This directory contains the refactored learning components for the LearnFlow AI application. The original monolithic `StartLearning.tsx` component has been broken down into smaller, focused components for better maintainability and reusability.

## Structure

### Core Components

- **`InputStage.tsx`** - Initial topic input screen with AI-powered learning path generation
- **`LearningPathStage.tsx`** - Interactive timeline showing the learning journey
- **`VideoStage.tsx`** - Video player with YouTube integration and upcoming topics sidebar
- **`QuizStage.tsx`** - Knowledge assessment with adaptive scoring
- **`AdaptiveStage.tsx`** - Remedial content display for low quiz scores
- **`CompleteStage.tsx`** - Course completion celebration screen

### Supporting Files

- **`index.ts`** - Barrel export for easy component imports
- **`README.md`** - This documentation file

## Architecture

### State Management
- Uses a custom `useLearningState` hook for centralized state management
- All API calls are handled through the `api.ts` service layer
- Utility functions are separated into `utils.ts`

### Component Communication
- Components receive props for data and callbacks
- State updates are handled through the custom hook
- No direct state manipulation within components

### Benefits of Refactoring

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Components can be easily reused or modified
3. **Testability** - Smaller components are easier to unit test
4. **Maintainability** - Changes to one stage don't affect others
5. **Type Safety** - Strong TypeScript interfaces for all props and data

## Usage

```tsx
import {
  InputStage,
  LearningPathStage,
  VideoStage,
  QuizStage,
  AdaptiveStage,
  CompleteStage,
} from './learning';
```

## Dependencies

- `lucide-react` - Icons
- `react-youtube` - YouTube video player
- Custom hooks and utilities from `../hooks` and `../../lib` 