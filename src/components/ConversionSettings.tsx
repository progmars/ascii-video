import { useState } from 'react';

interface ConversionSettingsProps {
  resolution: number;
  setResolution: (value: number) => void;
  onStartConversion: (characterSet: string) => void;
  onCancelConversion: () => void;
  isConverting: boolean;
  progress: number;
  previewFrame: string | null;
}

const ConversionSettings = ({
  resolution,
  setResolution,
  onStartConversion,
  onCancelConversion,
  isConverting,
  progress,
  previewFrame
}: ConversionSettingsProps) => {  const [characterSet, setCharacterSet] = useState<'standard' | 'extended' | 'simple'>('standard');

  const characterSets = {
    simple: " .,:;=+*#@",
    standard: " .`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    extended: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Conversion Settings</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">ASCII Resolution</label>
        <input
          type="range"
          min="20"
          max="200"
          value={resolution}
          onChange={(e) => setResolution(parseInt(e.target.value))}
          disabled={isConverting}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Low Detail</span>
          <span>Current: {resolution} characters width</span>
          <span>High Detail</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Character Set</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setCharacterSet('simple')}
            disabled={isConverting}
            className={`px-3 py-1 rounded-md ${
              characterSet === 'simple' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setCharacterSet('standard')}
            disabled={isConverting}
            className={`px-3 py-1 rounded-md ${
              characterSet === 'standard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setCharacterSet('extended')}
            disabled={isConverting}
            className={`px-3 py-1 rounded-md ${
              characterSet === 'extended' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Extended
          </button>
        </div>
        <div className="mt-2 p-3 bg-gray-200 dark:bg-gray-700 rounded-md font-mono text-xs overflow-x-auto">
          {characterSets[characterSet]}
        </div>
      </div>

      {previewFrame && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Current Frame Preview</label>
          <img 
            src={previewFrame} 
            alt="Preview frame" 
            className="w-full h-auto rounded-md shadow-sm"
          />
        </div>
      )}

      {isConverting ? (
        <div className="space-y-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center text-sm">
            Converting... {Math.round(progress)}%
          </div>
          <button
            onClick={onCancelConversion}
            className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Cancel Conversion
          </button>
        </div>      ) : (
        <button
          onClick={() => onStartConversion(characterSets[characterSet])}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Start Conversion
        </button>
      )}
    </div>
  );
};

export default ConversionSettings;
