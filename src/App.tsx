import { useState, useEffect } from 'react'
import './App.css'
import VideoUploader from './components/VideoUploader'
import ConversionSettings from './components/ConversionSettings'
import AsciiPlayer from './components/AsciiPlayer'
import useAsciiConverter from './hooks/useAsciiConverter'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resolution, setResolution] = useState<number>(80)
  const [activeTab, setActiveTab] = useState<'upload' | 'convert' | 'play'>('upload')
  
  const {
    status,
    progress,
    previewFrame,
    asciiVideo,
    startConversion,
    cancelConversion,
    error
  } = useAsciiConverter()
  
  // Move to appropriate tab based on status
  useEffect(() => {
    if (status === 'idle' && !selectedFile) {
      setActiveTab('upload');
    } else if (status === 'completed') {
      setActiveTab('play');
    } else if (selectedFile) {
      setActiveTab('convert');
    }
  }, [status, selectedFile]);
  
  const handleVideoSelected = (file: File) => {
    setSelectedFile(file);
    setActiveTab('convert');
  };
  
  const handleStartConversion = (selectedCharacterSet: string) => {
    if (selectedFile) {
      startConversion(selectedFile, resolution, selectedCharacterSet);
    }
  };
  
  const handleRestart = () => {
    setActiveTab('upload');
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ASCII Video Converter</h1>
          
          {/* Tabs */}
          <nav className="flex space-x-1">
            <button
              onClick={() => selectedFile ? setActiveTab('upload') : null}
              disabled={!selectedFile && activeTab !== 'upload'}
              className={`px-4 py-2 rounded-t-md transition-colors ${
                activeTab === 'upload' 
                  ? 'bg-white text-blue-600 font-medium' 
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => selectedFile ? setActiveTab('convert') : null}
              disabled={!selectedFile}
              className={`px-4 py-2 rounded-t-md transition-colors ${
                activeTab === 'convert' 
                  ? 'bg-white text-blue-600 font-medium' 
                  : 'bg-blue-700 hover:bg-blue-800'
              } ${!selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Convert
            </button>
            <button
              onClick={() => asciiVideo ? setActiveTab('play') : null}
              disabled={!asciiVideo}
              className={`px-4 py-2 rounded-t-md transition-colors ${
                activeTab === 'play' 
                  ? 'bg-white text-blue-600 font-medium' 
                  : 'bg-blue-700 hover:bg-blue-800'
              } ${!asciiVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Play
            </button>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Upload Your Video</h2>
            <VideoUploader 
              onVideoSelected={handleVideoSelected} 
              isProcessing={status === 'loading' || status === 'converting'}
            />
            
            {/* File info display if file selected but not yet converted */}
            {selectedFile && status === 'idle' && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="font-semibold">Selected File</h3>
                <p><span className="text-gray-500">Name:</span> {selectedFile.name}</p>
                <p><span className="text-gray-500">Size:</span> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setActiveTab('convert')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Continue to Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Convert Tab */}
        {activeTab === 'convert' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              {status === 'converting' 
                ? 'Converting...' 
                : 'Conversion Settings'}
            </h2>
            
            {/* Display selected file info */}
            {selectedFile && (
              <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="font-semibold">Selected File</h3>
                <p><span className="text-gray-500">Name:</span> {selectedFile.name}</p>
                <p><span className="text-gray-500">Size:</span> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
            
            {/* Settings */}
            <ConversionSettings
              resolution={resolution}
              setResolution={setResolution}
              onStartConversion={handleStartConversion}
              onCancelConversion={cancelConversion}
              isConverting={status === 'converting' || status === 'loading'}
              progress={progress}
              previewFrame={previewFrame}
            />
            
            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 rounded-md">
                {error}
              </div>
            )}
          </div>
        )}
        
        {/* Play Tab */}
        {activeTab === 'play' && asciiVideo && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">ASCII Video Player</h2>
            
            <AsciiPlayer
              frames={asciiVideo.frames}
              fps={asciiVideo.fps}
              audio={asciiVideo.audio}
              onEnded={() => {}}
            />
            
            <div className="mt-8 text-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Convert Another Video
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 bg-gray-200 dark:bg-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>ASCII Video Converter v1.0 | Created with React + Vite + Tailwind CSS</p>
      </footer>
    </div>
  )
}

export default App
