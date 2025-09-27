import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
        <motion.div
          key={currentState}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.4, 0, 0.2, 1],
            scale: { duration: 0.3 }
          }}
        >
          {renderCurrentScreen()}
        </motion.div>
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
