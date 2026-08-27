import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  // SVG Config
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Get color based on score
  const getColorClass = (val: number) => {
    if (val < 50) return 'text-red-500 stroke-red-500';
    if (val < 75) return 'text-amber-500 stroke-amber-500';
    return 'text-emerald-500 stroke-emerald-500';
  };

  const getBgGlow = (val: number) => {
    if (val < 50) return 'rgba(239, 68, 68, 0.15)';
    if (val < 75) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(16, 185, 129, 0.15)';
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl relative">
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-2xl filter blur-xl transition-all duration-700 opacity-30"
        style={{ backgroundColor: getBgGlow(score) }}
      />

      <div className="relative w-40 h-40">
        {/* Background track circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="fill-transparent stroke-gray-800/40"
            strokeWidth={strokeWidth}
          />
          {/* Animated active progress circle */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            className={`fill-transparent transition-colors duration-500 ${getColorClass(score).split(' ')[1]}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-4xl font-extrabold font-display transition-colors duration-500 ${getColorClass(score).split(' ')[0]}`}
          >
            {score}%
          </motion.span>
          <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-1">Match Score</span>
        </div>
      </div>

      {/* Label and descriptions */}
      <div className="mt-4 text-center">
        {score < 50 && (
          <p className="text-sm font-medium text-red-400">Needs Work ⚠️</p>
        )}
        {score >= 50 && score < 75 && (
          <p className="text-sm font-medium text-amber-400">Average Match 👍</p>
        )}
        {score >= 75 && (
          <p className="text-sm font-medium text-emerald-400">ATS Optimized! 🚀</p>
        )}
        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
          Target score for most resume screening models is 75%+
        </p>
      </div>
    </div>
  );
};
