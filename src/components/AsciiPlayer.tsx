import { useState, useEffect, useRef } from 'react';

interface AsciiFrame {
  characters: string[];
  colors: string[];
  width: number;
  height: number;
}

interface AsciiPlayerProps {
  frames: AsciiFrame[];
  fps: number;
  audio?: HTMLAudioElement;
  onEnded: () => void;
}

const AsciiPlayer = ({ frames, fps, audio, onEnded }: AsciiPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
    const playerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate duration based on frames and fps
  useEffect(() => {
    setDuration(frames.length / fps);
  }, [frames, fps]);
  
  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle audio volume
  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [audio, volume]);
  
  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      let startTime = performance.now();
      const frameDuration = 1000 / fps;
      
      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        
        if (elapsed >= frameDuration) {
          // Update to the next frame
          setCurrentFrame(prev => {
            const next = prev + 1;
            
            if (next >= frames.length) {
              setIsPlaying(false);
              onEnded();
              return 0; // Reset to beginning
            }
            
            // Update current time
            setCurrentTime(next / fps);
            
            return next;
          });
          
          startTime = timestamp;
        }
        
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      // Start audio if available
      if (audio && audio.paused) {
        audio.play().catch(e => console.error("Audio playback error:", e));
      }
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        if (audio && !audio.paused) {
          audio.pause();
        }
      };
    }
  }, [isPlaying, frames, fps, audio, onEnded]);
  
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
    
    if (audio) {
      if (audio.paused) {
        audio.play().catch(e => console.error("Audio playback error:", e));
      } else {
        audio.pause();
      }
    }
  };
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    const frameIndex = Math.floor(seekTime * fps);
    
    setCurrentFrame(frameIndex);
    setCurrentTime(seekTime);
    
    if (audio) {
      audio.currentTime = seekTime;
    }
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Render current frame
  const renderCurrentFrame = () => {
    if (!frames.length || currentFrame >= frames.length) return null;
    
    const frame = frames[currentFrame];
    const lines = [];
    
    for (let y = 0; y < frame.height; y++) {
      const lineChars = [];
      
      for (let x = 0; x < frame.width; x++) {
        const index = y * frame.width + x;
        const char = frame.characters[index];
        const color = frame.colors[index];
        
        lineChars.push(
          <span key={`${x}-${y}`} style={{ color }}>
            {char}
          </span>
        );
      }
      
      lines.push(
        <div key={y} className="whitespace-pre">
          {lineChars}
        </div>
      );
    }
    
    return <div className="font-mono text-xs leading-none">{lines}</div>;
  };

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto bg-black rounded-lg shadow-lg overflow-hidden">
      {/* ASCII Display Area */}
      <div 
        ref={playerRef}
        className="bg-black p-4 overflow-auto aspect-video flex items-center justify-center"
        style={{ 
          minHeight: '300px',
          fontSize: isFullscreen ? '0.6vw' : 'inherit'
        }}
      >
        {frames.length > 0 ? renderCurrentFrame() : (
          <div className="text-gray-500">No ASCII video loaded</div>
        )}
      </div>
      
      {/* Controls */}
      <div className={`bg-gray-900 p-3 ${isFullscreen ? 'absolute bottom-0 left-0 right-0 bg-opacity-75' : ''}`}>
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration.toString()}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        
        {/* Time Display */}
        <div className="flex justify-between text-xs text-gray-400 mt-1 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Control Buttons */}        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlayPause}
              className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 focus:outline-none"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7-11-7z" />
                </svg>
              )}
            </button>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                className="text-white hover:text-blue-400 focus:outline-none"
              >
                {volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-400 focus:outline-none"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsciiPlayer;
