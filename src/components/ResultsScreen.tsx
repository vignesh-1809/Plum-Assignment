import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Star,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react';

const ResultsScreen: React.FC = () => {
  const { result, quizData, resetQuiz } = useQuiz();
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  if (!result || !quizData) return null;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-yellow-500';
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 70) return 'text-blue-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding!';
    if (percentage >= 80) return 'Great Job!';
    if (percentage >= 70) return 'Good Work!';
    if (percentage >= 60) return 'Not Bad!';
    return 'Keep Learning!';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🥇';
    if (percentage >= 70) return '🥈';
    if (percentage >= 60) return '🥉';
    return '📚';
  };

  const handleShare = async () => {
    const shareText = `I just scored ${result.percentage}% on the ${quizData.topic} quiz! Test your knowledge too!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Knowledge Quiz Results',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Results copied to clipboard!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {getScoreIcon(result.percentage)}
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {getScoreMessage(result.percentage)}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {quizData.topic} Quiz Complete
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card mb-8 text-center"
        >
          <div className="mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.5, 
              type: "spring", 
              stiffness: 200,
              damping: 15
            }}
            className={`text-6xl font-bold ${getScoreColor(result.percentage)} mb-2 relative`}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {result.percentage}%
            </motion.span>
            {/* Celebration particles */}
            {result.percentage >= 80 && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      scale: 0, 
                      x: 0, 
                      y: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      scale: [0, 1, 0],
                      x: Math.cos(i * 60 * Math.PI / 180) * 100,
                      y: Math.sin(i * 60 * Math.PI / 180) * 100,
                      rotate: 360
                    }}
                    transition={{ 
                      delay: 1 + i * 0.1,
                      duration: 1.5,
                      ease: "easeOut"
                    }}
                    className="absolute text-yellow-400 text-2xl"
                  >
                    ✨
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {result.score} out of {result.totalQuestions} questions correct
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
            <motion.div
              className={`h-3 rounded-full ${
                result.percentage >= 80 ? 'bg-green-500' :
                result.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${result.percentage}%` }}
              transition={{ duration: 1, delay: 0.7 }}
            />
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={resetQuiz}
              className="btn-primary flex items-center justify-center"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                whileHover={{ rotate: -180 }}
                transition={{ duration: 0.3 }}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
              </motion.div>
              Take Another Quiz
            </motion.button>
            
            <motion.button
              onClick={handleShare}
              className="btn-secondary flex items-center justify-center"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.2 }}
              >
                <Share2 className="w-5 h-5 mr-2" />
              </motion.div>
              Share Results
            </motion.button>
            
            <motion.button
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="btn-secondary flex items-center justify-center"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: showDetailedResults ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {showDetailedResults ? (
                  <EyeOff className="w-5 h-5 mr-2" />
                ) : (
                  <Eye className="w-5 h-5 mr-2" />
                )}
              </motion.div>
              {showDetailedResults ? 'Hide Details' : 'Show Details'}
            </motion.button>
          </div>
        </motion.div>

        {/* AI Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card mb-8"
        >
          <div className="flex items-start space-x-3 mb-4">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
              <Star className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Feedback
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {result.feedback}
          </p>
        </motion.div>

        {/* Detailed Results */}
        {showDetailedResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Question Review
            </h3>
            
            <div className="space-y-6">
              {quizData.questions.map((question, index) => {
                const userAnswer = result.userAnswers[index];
                const correctAnswer = result.correctAnswers[index];
                const isCorrect = userAnswer === correctAnswer;
                
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white flex-1">
                        Question {index + 1}
                      </h4>
                      <div className="flex items-center ml-4">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-success-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-error-500" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {question.question}
                    </p>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isUserAnswer = userAnswer === optionIndex;
                        const isCorrectOption = correctAnswer === optionIndex;
                        
                        let optionStyle = 'p-2 rounded text-sm ';
                        if (isCorrectOption) {
                          optionStyle += 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200 border border-success-300 dark:border-success-700';
                        } else if (isUserAnswer && !isCorrect) {
                          optionStyle += 'bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-200 border border-error-300 dark:border-error-700';
                        } else {
                          optionStyle += 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
                        }
                        
                        return (
                          <div key={optionIndex} className={optionStyle}>
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option}
                            {isCorrectOption && (
                              <span className="ml-2 text-success-600 dark:text-success-400 font-medium">
                                ✓ Correct
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="ml-2 text-error-600 dark:text-error-400 font-medium">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen;
