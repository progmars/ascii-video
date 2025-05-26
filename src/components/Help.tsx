import { useState } from 'react';

const helpSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
      # Getting Started
      
      Welcome to ASCII Video Converter! This application lets you transform standard videos into ASCII art animations.
      
      ## Basic Usage
      
      1. **Upload a Video** - Click the upload area or drag and drop an MP4 video file
      2. **Configure Settings** - Adjust resolution and character set to your liking
      3. **Convert** - Wait for the conversion to complete
      4. **Play & Share** - Play your ASCII video and download it in various formats
      
      > **Note**: Maximum file size is 10MB for optimal performance
    `,
  },
  {
    id: 'conversion-settings',
    title: 'Conversion Settings',
    content: `
      # Conversion Settings
      
      Fine-tune your ASCII video with these settings:
      
      ## Resolution
      
      Controls how many pixels are represented by each character:
      
      - **Higher Resolution** (lower value): More detailed but smaller ASCII art
      - **Lower Resolution** (higher value): Larger characters with less detail
      
      ## Character Sets
      
      Different character sets create different visual effects:
      
      - **Standard**: Basic set with varied brightness levels (' .:-=+*#%@')
      - **Detailed**: More gradual transition between light and dark
      - **Blocks**: Uses block characters for a more solid appearance
      - **Simple**: Minimal set for a cleaner look
      
      You can also create a custom character set by entering characters ordered from darkest to lightest.
    `,
  },
  {
    id: 'playback',
    title: 'Playback Controls',
    content: `
      # Playback Controls
      
      After converting your video, you can:
      
      - **Play/Pause**: Start or stop playback
      - **Seek**: Click anywhere on the progress bar to jump to that point
      - **Volume**: Adjust sound level (if original video had audio)
      - **Fullscreen**: View your ASCII video in fullscreen mode
      
      ## Keyboard Shortcuts
      
      - **Space**: Play/Pause
      - **Left/Right Arrows**: Skip backward/forward
      - **M**: Mute/Unmute
      - **F**: Toggle fullscreen
    `,
  },
  {
    id: 'download',
    title: 'Downloading & Sharing',
    content: `
      # Downloading & Sharing
      
      Save your creation in different formats:
      
      ## Format Options
      
      - **JSON**: Complete data for later playback in this app
      - **Text File**: Plain text with frames separated by markers
      - **HTML**: Self-contained web page with player
      
      ## Offline Usage
      
      This app works completely offline after initial load as it's a Progressive Web App (PWA):
      
      - Add to your home screen for app-like experience
      - Previously converted videos are stored locally
      - No internet required for video conversion or playback
    `,
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: `
      # Troubleshooting
      
      ## Common Issues
      
      **Video won't convert**
      - Ensure it's an MP4 file under 10MB
      - Try a different browser (Chrome recommended)
      - Clear browser cache and reload
      
      **Playback is slow**
      - Use a lower resolution setting
      - Try a simpler character set
      - Close other browser tabs/applications
      
      **Cannot download**
      - Check browser download permissions
      - Try a different format
      
      ## Support
      
      If you're still experiencing issues, please visit our GitHub repository to report a bug or request help.
    `,
  },
];

export function Help() {
  const [activeSection, setActiveSection] = useState(helpSections[0].id);
  
  const renderMarkdown = (markdown: string) => {
    // This is a very simple markdown parser
    // In a production app, you would use a proper markdown library
    
    const html = markdown
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mt-3 mb-2">$1</h3>')
      
      // Lists
      .replace(/^\s*\n\* (.*)/gim, '<ul class="list-disc pl-5 mb-4"><li>$1</li>')
      .replace(/^\* (.*)/gim, '<li>$1</li>')
      .replace(/^\s*\n- (.*)/gim, '<ul class="list-disc pl-5 mb-4"><li>$1</li>')
      .replace(/^- (.*)/gim, '<li>$1</li>')
      .replace(/^\s*\n\d\. (.*)/gim, '<ol class="list-decimal pl-5 mb-4"><li>$1</li>')
      .replace(/^\d\. (.*)/gim, '<li>$1</li>')
      
      // End lists
      .replace(/<\/ul>\s*<\/ul>/gim, '</ul>')
      .replace(/<\/ol>\s*<\/ol>/gim, '</ol>')
      
      // Paragraphs
      .replace(/^\s*\n\s*\n/gim, '</p><p class="mb-4">')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2 mb-4 text-gray-700 dark:text-gray-300 italic">$1</blockquote>')
      
      // Bold and italic
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      
      // Code
      .replace(/`(.*?)`/gim, '<code class="bg-gray-200 dark:bg-gray-800 px-1 rounded">$1</code>');
      
    return `<div class="prose dark:prose-invert max-w-none"><p class="mb-4">${html}</p></div>`;
  };
  
  const activeContent = helpSections.find(section => section.id === activeSection)?.content || '';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        {/* Sidebar */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 md:w-64 md:flex-shrink-0">
          <h2 className="font-bold text-lg mb-4">Help Topics</h2>
          <nav>
            <ul className="space-y-2">
              {helpSections.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6 md:flex-grow overflow-y-auto max-h-[600px]">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(activeContent) }} />
        </div>
      </div>    </div>
  );
};
