export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation?: string;
  // Flag to indicate if this is multiple-answer question (calculated internally)
  multipleAnswer?: boolean;
}

export interface Quiz {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}
