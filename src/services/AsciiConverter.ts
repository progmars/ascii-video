export interface AsciiFrame {
  characters: string[];
  colors: string[];
  width: number;
  height: number;
}

export interface AsciiVideo {
  frames: AsciiFrame[];
  fps: number;
  audio?: HTMLAudioElement;
}

class AsciiConverter {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private characterSet: string;
  private frameSkip: number = 2; // Process every nth frame to reduce workload

  constructor(characterSet: string = " .,:;=+*#@") {
    // Create elements
    this.video = document.createElement('video');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.characterSet = characterSet;
    
    // Configure video
    this.video.playsInline = true;
    this.video.muted = true;
  }

  public async loadVideo(videoFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create a blob URL for the video
      const videoURL = URL.createObjectURL(videoFile);
      
      // Set up event listeners
      this.video.onloadedmetadata = () => {
        resolve();
      };
      
      this.video.onerror = (e) => {
        reject(new Error(`Failed to load video: ${e}`));
      };
      
      // Load the video
      this.video.src = videoURL;
    });
  }
  
  public async convertToAscii(
    targetWidth: number,
    onProgress: (progress: number, previewDataUrl?: string) => void,
    onCancel: () => boolean
  ): Promise<AsciiVideo> {
    // Calculate target height to maintain aspect ratio
    const aspectRatio = this.video.videoHeight / this.video.videoWidth;
    const targetHeight = Math.floor(targetWidth * aspectRatio * 0.5); // * 0.5 to account for character aspect ratio
    
    // Set canvas size
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    // Get total frames for progress calculation
    const duration = this.video.duration;
    const frameCount = Math.floor(duration * 30); // Assuming 30fps
    const totalFramesToProcess = Math.floor(frameCount / this.frameSkip);
    
    // Arrays to hold the processed frames
    const frames: AsciiFrame[] = [];
    
    // Start video playback
    this.video.currentTime = 0;
    await this.video.play();
    
    // Extract audio
    const audio = await this.extractAudio();
    
    // Process frames
    let processedFrames = 0;
    
    while (this.video.currentTime < duration) {
      // Check if processing was canceled
      if (onCancel()) {
        this.video.pause();
        return { frames: [], fps: 30 / this.frameSkip };
      }
      
      // Draw current video frame to canvas
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      
      // Create ASCII frame
      const frame = this.frameToAscii(targetWidth, targetHeight);
      frames.push(frame);
      
      // Generate preview for progress updates (every 10 frames)
      let previewDataUrl: string | undefined;
      if (processedFrames % 10 === 0) {
        previewDataUrl = this.canvas.toDataURL('image/jpeg', 0.3); // Low quality for preview
      }
      
      // Update progress
      processedFrames++;
      const progress = (processedFrames / totalFramesToProcess) * 100;
      onProgress(progress, previewDataUrl);
      
      // Skip ahead to the next frame to process
      await this.seekToNextFrame(this.frameSkip);
    }
    
    // Stop video
    this.video.pause();
    
    // Clean up blob URL
    URL.revokeObjectURL(this.video.src);
    
    return {
      frames,
      fps: 30 / this.frameSkip, // Adjust fps to match our sampling rate
      audio
    };
  }
  
  private frameToAscii(targetWidth: number, targetHeight: number): AsciiFrame {
    const pixelData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    
    // Result arrays
    const characters: string[] = new Array(targetWidth * targetHeight);
    const colors: string[] = new Array(targetWidth * targetHeight);
    
    // Calculate sample intervals
    const xStep = Math.floor(this.canvas.width / targetWidth);
    const yStep = Math.floor(this.canvas.height / targetHeight);
    
    // Process the frame
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        // Get pixel from original image
        const sourceX = x * xStep;
        const sourceY = y * yStep;
        
        // Sample multiple pixels for better result
        const brightness = this.sampleBrightness(pixelData, sourceX, sourceY, xStep, yStep);
        const averageColor = this.sampleColor(pixelData, sourceX, sourceY, xStep, yStep);
        
        // Map brightness to character
        const charIndex = Math.floor((brightness / 255) * (this.characterSet.length - 1));
        const char = this.characterSet[charIndex];
        
        // Store in result arrays
        const resultIndex = y * targetWidth + x;
        characters[resultIndex] = char;
        colors[resultIndex] = averageColor;
      }
    }
    
    return {
      characters,
      colors,
      width: targetWidth,
      height: targetHeight
    };
  }
  
  private sampleBrightness(
    pixelData: Uint8ClampedArray,
    startX: number,
    startY: number,
    sampleWidth: number,
    sampleHeight: number
  ): number {
    let totalBrightness = 0;
    let sampleCount = 0;
    
    // Sample a grid of pixels and average the brightness
    for (let y = startY; y < startY + sampleHeight && y < this.canvas.height; y += 2) {
      for (let x = startX; x < startX + sampleWidth && x < this.canvas.width; x += 2) {
        const index = (y * this.canvas.width + x) * 4;
        
        // Calculate brightness (luminance formula: 0.299R + 0.587G + 0.114B)
        const r = pixelData[index];
        const g = pixelData[index + 1];
        const b = pixelData[index + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        
        totalBrightness += brightness;
        sampleCount++;
      }
    }
    
    return sampleCount > 0 ? totalBrightness / sampleCount : 0;
  }
  
  private sampleColor(
    pixelData: Uint8ClampedArray,
    startX: number,
    startY: number,
    sampleWidth: number,
    sampleHeight: number
  ): string {
    let totalR = 0, totalG = 0, totalB = 0;
    let sampleCount = 0;
    
    // Sample a grid of pixels and average the color
    for (let y = startY; y < startY + sampleHeight && y < this.canvas.height; y += 2) {
      for (let x = startX; x < startX + sampleWidth && x < this.canvas.width; x += 2) {
        const index = (y * this.canvas.width + x) * 4;
        
        totalR += pixelData[index];
        totalG += pixelData[index + 1];
        totalB += pixelData[index + 2];
        
        sampleCount++;
      }
    }
    
    if (sampleCount > 0) {
      const avgR = Math.floor(totalR / sampleCount);
      const avgG = Math.floor(totalG / sampleCount);
      const avgB = Math.floor(totalB / sampleCount);
      
      return `rgb(${avgR}, ${avgG}, ${avgB})`;
    }
    
    return 'rgb(255, 255, 255)';
  }
  
  private async seekToNextFrame(skipFrames: number): Promise<void> {
    return new Promise<void>(resolve => {
      // Calculate how far to seek ahead (assuming 30fps)
      const seekDelta = (skipFrames / 30);
      const targetTime = Math.min(this.video.currentTime + seekDelta, this.video.duration);
      
      const handleSeeked = () => {
        this.video.removeEventListener('seeked', handleSeeked);
        resolve();
      };
      
      this.video.addEventListener('seeked', handleSeeked);
      this.video.currentTime = targetTime;
    });
  }
  
  private async extractAudio(): Promise<HTMLAudioElement | undefined> {
    try {
      // Create an audio element
      const audio = new Audio();
      
      // Use the same source as the video
      audio.src = this.video.src;
      
      return audio;
    } catch (error) {
      console.error("Failed to extract audio:", error);
      return undefined;
    }
  }
  
  public setCharacterSet(chars: string): void {
    this.characterSet = chars;
  }
  
  public setFrameSkip(skip: number): void {
    this.frameSkip = Math.max(1, skip);
  }
}

export default AsciiConverter;
