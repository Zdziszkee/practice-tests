// practice-tests/src/types/quiz.ts
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  // Changed from single ID to array of IDs for multiple correct answers
  correctOptionIds: string[];
  explanation?: string;
  // Flag to indicate if this is multiple-answer question
  multipleAnswer?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
}
