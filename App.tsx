import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { WebcamCapture } from './components/WebcamCapture';
import { ResultCard } from './components/ResultCard';
import { Spinner } from './components/Spinner';
import { analyzeChilliLeaf } from './services/geminiService';
import type { AnalysisResult } from './types';
import { CameraIcon } from './components/icons';

// Utility to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the initial 'data:image/jpeg;base64,' part
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState<boolean>(false);

  const handleImageSelect = (file: File) => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzeChilliLeaf(base64Image, imageFile.type);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze the image. The AI model may be overloaded. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const resetState = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageFile(null);
    setImageUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setShowWebcam(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center font-sans">
      <Header />
      <main className="flex-grow w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col items-center">
        {!showWebcam ? (
          <div className="w-full bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
            <ImageUploader 
              onImageSelect={handleImageSelect} 
              onWebcamClick={() => setShowWebcam(true)} 
              imageUrl={imageUrl} 
              reset={resetState}
            />

            {imageUrl && (
              <div className="w-full flex justify-center">
                <button
                  onClick={handleAnalyzeClick}
                  disabled={isLoading}
                  className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  {isLoading ? <Spinner /> : <span>🔍 Analyze Disease</span>}
                </button>
              </div>
            )}
            
            {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
            
            {!isLoading && analysisResult && <ResultCard result={analysisResult} />}

          </div>
        ) : (
          <WebcamCapture 
            onCapture={handleImageSelect} 
            onClose={() => setShowWebcam(false)} 
          />
        )}
      </main>
      <footer className="w-full text-center p-4 text-gray-500 text-sm">
        Powered by Google Gemini API
      </footer>
    </div>
  );
};

export default App;
