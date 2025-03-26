export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string | number; // Could be the index or the actual answer text
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}
