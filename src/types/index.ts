export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
  explanation?: string;
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  feedback: string;
  correctAnswers: number[];
  userAnswers: number[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export type QuizState = 'topic-selection' | 'loading' | 'quiz' | 'results';

export interface QuizContextType {
  currentState: QuizState;
  selectedTopic: Topic | null;
  quizData: QuizData | null;
  currentQuestionIndex: number;
  userAnswers: number[];
  result: QuizResult | null;
  isLoading: boolean;
  error: string | null;
  selectTopic: (topic: Topic) => void;
  startQuiz: () => Promise<void>;
  answerQuestion: (answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
  setError: (error: string | null) => void;
}
