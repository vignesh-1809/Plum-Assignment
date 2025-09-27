import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, RotateCcw } from 'lucide-react';

const QuizInterface: React.FC = () => {
  const {
    quizData,
    currentQuestionIndex,
    userAnswers,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
    isLoading,
  } = useQuiz();

  const [showExplanation, setShowExplanation] = useState(false);

  if (!quizData) return null;

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const hasAnswered = userAnswers[currentQuestionIndex] !== -1;
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    answerQuestion(answerIndex);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      submitQuiz();
    } else {
      nextQuestion();
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    previousQuestion();
    setShowExplanation(false);
  };

  const getOptionStyle = (index: number) => {
    const isSelected = userAnswers[currentQuestionIndex] === index;
    const isCorrect = index === currentQuestion.correctAnswer;
    const isWrong = isSelected && !isCorrect;

    if (showExplanation) {
      if (isCorrect) {
        return 'border-success-500 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300';
      }
      if (isWrong) {
        return 'border-error-500 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300';
      }
      return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700';
    }

    if (isSelected) {
      return 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300';
    }

    return 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={resetQuiz}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Back to Topics
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Question {currentQuestionIndex + 1} of {quizData.questions.length}
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ 
                duration: 0.8, 
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: 1
                }}
              />
            </motion.div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {quizData.topic} Quiz
          </h1>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="card mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300 flex items-center space-x-3 ${getOptionStyle(index)} ${
                  showExplanation ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex-shrink-0">
                  {showExplanation && index === currentQuestion.correctAnswer ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20,
                        delay: 0.2
                      }}
                    >
                      <CheckCircle className="w-6 h-6 text-success-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Circle className="w-6 h-6" />
                    </motion.div>
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </motion.button>
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Explanation:
                </h4>
                <p className="text-blue-800 dark:text-blue-200">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center"
        >
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="flex items-center px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="flex space-x-2">
            {quizData.questions.map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary-600'
                    : userAnswers[index] !== -1
                    ? 'bg-success-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                animate={{
                  scale: index === currentQuestionIndex ? 1.2 : 1,
                  opacity: index === currentQuestionIndex ? 1 : 0.7
                }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.3 }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!hasAnswered || isLoading}
            className="btn-primary flex items-center"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Submitting...
              </>
            ) : (
              <>
                {isLastQuestion ? 'Submit Quiz' : 'Next'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizInterface;
