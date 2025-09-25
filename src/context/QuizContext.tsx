import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QuizContextType, QuizState, Topic, QuizData, QuizResult } from '../types';
import { aiService } from '../services/aiService';

// Initial state
const initialState = {
  currentState: 'topic-selection' as QuizState,
  selectedTopic: null as Topic | null,
  quizData: null as QuizData | null,
  currentQuestionIndex: 0,
  userAnswers: [] as number[],
  result: null as QuizResult | null,
  isLoading: false,
  error: null as string | null,
};

// Action types
type QuizAction =
  | { type: 'SELECT_TOPIC'; payload: Topic }
  | { type: 'START_LOADING' }
  | { type: 'SET_QUIZ_DATA'; payload: QuizData }
  | { type: 'ANSWER_QUESTION'; payload: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'SET_RESULT'; payload: QuizResult }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_QUIZ' };

// Reducer
function quizReducer(state: typeof initialState, action: QuizAction): typeof initialState {
  switch (action.type) {
    case 'SELECT_TOPIC':
      return {
        ...state,
        selectedTopic: action.payload,
        error: null,
      };
    
    case 'START_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'SET_QUIZ_DATA':
      return {
        ...state,
        quizData: action.payload,
        currentState: 'quiz',
        isLoading: false,
        currentQuestionIndex: 0,
        userAnswers: new Array(action.payload.questions.length).fill(-1),
        error: null,
      };
    
    case 'ANSWER_QUESTION':
      const newAnswers = [...state.userAnswers];
      newAnswers[state.currentQuestionIndex] = action.payload;
      return {
        ...state,
        userAnswers: newAnswers,
      };
    
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          (state.quizData?.questions.length || 1) - 1
        ),
      };
    
    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      };
    
    case 'SET_RESULT':
      return {
        ...state,
        result: action.payload,
        currentState: 'results',
        isLoading: false,
        error: null,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'RESET_QUIZ':
      return {
        ...initialState,
      };
    
    default:
      return state;
  }
}

// Context
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Provider component
export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const selectTopic = (topic: Topic) => {
    dispatch({ type: 'SELECT_TOPIC', payload: topic });
  };

  const startQuiz = async () => {
    if (!state.selectedTopic) return;
    
    dispatch({ type: 'START_LOADING' });
    
    try {
      const quizData = await aiService.generateQuizQuestions(state.selectedTopic.name);
      dispatch({ type: 'SET_QUIZ_DATA', payload: quizData });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to generate quiz questions' 
      });
    }
  };

  const answerQuestion = (answerIndex: number) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: answerIndex });
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const previousQuestion = () => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  };

  const submitQuiz = async () => {
    if (!state.quizData || !state.selectedTopic) return;
    
    dispatch({ type: 'START_LOADING' });
    
    try {
      // Calculate score
      let correctCount = 0;
      const correctAnswers: number[] = [];
      
      state.quizData.questions.forEach((question, index) => {
        correctAnswers.push(question.correctAnswer);
        if (state.userAnswers[index] === question.correctAnswer) {
          correctCount++;
        }
      });
      
      const score = correctCount;
      const totalQuestions = state.quizData.questions.length;
      const percentage = Math.round((score / totalQuestions) * 100);
      
      // Generate AI feedback
      const feedback = await aiService.generateFeedback(score, totalQuestions, state.selectedTopic.name);
      
      const result: QuizResult = {
        score,
        totalQuestions,
        percentage,
        feedback,
        correctAnswers,
        userAnswers: state.userAnswers,
      };
      
      dispatch({ type: 'SET_RESULT', payload: result });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to generate feedback' 
      });
    }
  };

  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const contextValue: QuizContextType = {
    ...state,
    selectTopic,
    startQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
    setError,
  };

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
}

// Hook to use the context
export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
