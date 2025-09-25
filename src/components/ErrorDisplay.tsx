import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 max-w-md w-full mx-4"
    >
      <div className="bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-error-600 dark:text-error-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Error
            </h3>
            <p className="text-sm text-error-700 dark:text-error-300 mt-1">
              {error}
            </p>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 text-sm text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-200 font-medium flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Try Again
              </button>
            )}
          </div>
          
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-error-400 hover:text-error-600 dark:hover:text-error-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;
