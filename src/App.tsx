import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { QuizProvider, useQuiz } from './context/QuizContext';
import TopicSelection from './components/TopicSelection';
import QuizInterface from './components/QuizInterface';
import ResultsScreen from './components/ResultsScreen';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorDisplay from './components/ErrorDisplay';
import DarkModeToggle from './components/DarkModeToggle';

const AppContent: React.FC = () => {
  const { currentState, error, setError } = useQuiz();

  const renderCurrentScreen = () => {
    switch (currentState) {
      case 'topic-selection':
        return <TopicSelection />;
      case 'loading':
        return <TopicSelection />; // Loading overlay is handled in TopicSelection
      case 'quiz':
        return <QuizInterface />;
      case 'results':
        return <ResultsScreen />;
      default:
        return <TopicSelection />;
    }
  };

  return (
    <div className="App">
      <DarkModeToggle />
      
      <AnimatePresence mode="wait">
        {renderCurrentScreen()}
      </AnimatePresence>
      
      <AnimatePresence>
        {error && (
          <ErrorDisplay
            error={error}
            onDismiss={() => setError(null)}
            onRetry={() => {
              setError(null);
              // Add retry logic here if needed
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QuizProvider>
        <AppContent />
      </QuizProvider>
    </ErrorBoundary>
  );
};

export default App;
