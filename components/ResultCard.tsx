import React from 'react';
import type { AnalysisResult } from '../types';

interface ResultCardProps {
  result: AnalysisResult;
}

const getResultStyles = (disease: string) => {
  const lowerCaseDisease = disease.toLowerCase();
  if (lowerCaseDisease.includes('healthy')) {
    return {
      card: 'bg-green-50 border-green-500',
      title: 'text-green-800',
      progressBar: 'bg-green-500',
      progressBg: 'bg-green-200',
      badge: 'bg-green-200 text-green-800',
    };
  }
  if (lowerCaseDisease.includes('curl') || lowerCaseDisease.includes('spot')) {
    return {
      card: 'bg-yellow-50 border-yellow-500',
      title: 'text-yellow-800',
      progressBar: 'bg-yellow-500',
      progressBg: 'bg-yellow-200',
      badge: 'bg-yellow-200 text-yellow-800',
    };
  }
  if (lowerCaseDisease.includes('blight')) {
    return {
      card: 'bg-red-50 border-red-500',
      title: 'text-red-800',
      progressBar: 'bg-red-500',
      progressBg: 'bg-red-200',
      badge: 'bg-red-200 text-red-800',
    };
  }
  return {
    card: 'bg-gray-50 border-gray-500',
    title: 'text-gray-800',
    progressBar: 'bg-gray-500',
    progressBg: 'bg-gray-200',
    badge: 'bg-gray-200 text-gray-800',
  };
};

const ConfidenceBar: React.FC<{ value: number, barClass: string, bgClass: string }> = ({ value, barClass, bgClass }) => (
  <div className={`w-full ${bgClass} rounded-full h-2.5`}>
    <div className={`${barClass} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const styles = getResultStyles(result.disease);

  return (
    <div className={`mt-6 w-full p-6 border-l-4 rounded-r-lg shadow-md transition-all duration-500 ${styles.card}`}>
      <h2 className={`text-2xl font-bold ${styles.title} mb-4`}>Analysis Result</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Predicted Disease</h3>
          <p className={`text-xl font-semibold inline-block px-3 py-1 rounded-full mt-1 ${styles.badge}`}>
            {result.disease}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Confidence</h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="w-full">
               <ConfidenceBar value={result.confidence} barClass={styles.progressBar} bgClass={styles.progressBg} />
            </div>
            <span className={`font-bold text-lg ${styles.title}`}>{result.confidence}%</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Explanation</h3>
          <p className="text-gray-700 mt-1">{result.explanation}</p>
        </div>
      </div>
    </div>
  );
};
