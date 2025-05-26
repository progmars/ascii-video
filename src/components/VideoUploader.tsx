import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';

interface VideoUploaderProps {
  onVideoSelected: (file: File) => void;
  isProcessing: boolean;
}

const VideoUploader = ({ onVideoSelected, isProcessing }: VideoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_FILE_SIZE_MB = 10;
  const ALLOWED_FILE_TYPE = 'video/mp4';
  
  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file type
    if (file.type !== ALLOWED_FILE_TYPE) {
      setError('Please upload an MP4 video file only.');
      return false;
    }
    
    // Check file size (10MB max)
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return false;
    }
    
    return true;
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onVideoSelected(file);
      }
    }
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isProcessing) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onVideoSelected(file);
      }
    }
  };
  
  const handleButtonClick = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4"
          disabled={isProcessing}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg 
            className="w-16 h-16 text-gray-400"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <div className="text-xl font-medium">
            {isDragging ? 'Drop your video here' : 'Drag & drop your video here'}
          </div>
          
          <div className="text-gray-500 dark:text-gray-400">
            or
          </div>
          
          <button
            type="button"
            disabled={isProcessing}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Browse Files
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            MP4 format only, max {MAX_FILE_SIZE_MB}MB
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
