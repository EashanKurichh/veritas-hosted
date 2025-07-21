import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingOverlay = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50"
    >
      <div className="bg-zinc-900/90 rounded-2xl p-8 max-w-md mx-4 w-full border border-zinc-800">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
          <p className="text-white text-center font-medium">{message}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingOverlay; 