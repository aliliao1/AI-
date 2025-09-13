
import React from 'react';

interface FraudIndexGaugeProps {
  score: number;
}

const FraudIndexGauge: React.FC<FraudIndexGaugeProps> = ({ score }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const angle = -90 + (normalizedScore / 100) * 180;

  const getScoreColor = () => {
    if (normalizedScore <= 30) return '#22c55e'; // green-500
    if (normalizedScore <= 60) return '#facc15'; // yellow-400
    if (normalizedScore <= 80) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };
  
  const getScoreLabel = () => {
    if (normalizedScore <= 30) return '低風險';
    if (normalizedScore <= 60) return '中度風險';
    if (normalizedScore <= 80) return '高風險';
    return '極高風險';
  };

  const color = getScoreColor();
  const label = getScoreLabel();

  return (
    <div className="relative w-48 h-24" style={{ transform: 'translateZ(0)' }}>
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Background Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#475569" // slate-600
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="125.6"
          strokeDashoffset={125.6 - (normalizedScore / 100) * 125.6}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className="text-3xl font-bold" style={{ color: color }}>
          {normalizedScore}
        </span>
        <span className="block text-xs font-semibold tracking-wider" style={{ color: color }}>
          {label}
        </span>
      </div>
    </div>
  );
};

export default FraudIndexGauge;
