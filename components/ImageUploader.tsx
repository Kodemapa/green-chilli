import React, { useRef } from 'react';
import { CameraIcon, UploadIcon, TrashIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onWebcamClick: () => void;
  imageUrl: string | null;
  reset: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, onWebcamClick, imageUrl, reset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {imageUrl ? (
        <div className="w-full max-w-md p-4 border-2 border-dashed border-gray-300 rounded-lg text-center relative">
          <img src={imageUrl} alt="Selected leaf" className="max-h-80 w-auto mx-auto rounded-lg shadow-md" />
           <button 
            onClick={reset} 
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Remove image"
           >
            <TrashIcon />
          </button>
        </div>
      ) : (
        <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Select an Image</h2>
          <p className="text-gray-500 mb-6">Choose a file or use your webcam to get started.</p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
            />
            <button
              onClick={handleUploadClick}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              <UploadIcon />
              Upload Image
            </button>
            <button
              onClick={onWebcamClick}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
            >
              <CameraIcon />
              Use Webcam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
