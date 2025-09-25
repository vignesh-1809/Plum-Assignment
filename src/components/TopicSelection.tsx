import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { topics } from '../data/topics';
import { Brain, Sparkles } from 'lucide-react';

const TopicSelection: React.FC = () => {
  const { selectTopic, startQuiz, isLoading } = useQuiz();

  const handleTopicSelect = async (topic: typeof topics[0]) => {
    selectTopic(topic);
    await startQuiz();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-primary-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              AI Knowledge Quiz
            </h1>
            <Sparkles className="w-12 h-12 text-primary-600 ml-3" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Test your knowledge with AI-generated questions. Choose a topic and challenge yourself!
          </p>
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => handleTopicSelect(topic)}
            >
              <div className="card hover:shadow-xl transition-all duration-300 group-hover:border-primary-300 dark:group-hover:border-primary-600">
                <div className="flex items-start space-x-4">
                  <div className={`${topic.color} p-3 rounded-xl text-white text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {topic.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {topic.description}
                    </p>
                    <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                      <span>Start Quiz</span>
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm w-full mx-4">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Generating Quiz
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI is creating personalized questions for you...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Powered by AI • Each quiz contains 5 carefully crafted questions
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TopicSelection;
