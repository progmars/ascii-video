# ASCII Video Converter

A Progressive Web Application (PWA) that transforms standard MP4 videos into ASCII art animations, providing users with a unique and artistic way to view video content through text-based representations.

## Features

- **Video Upload**: Drag-and-drop or file selection for MP4 videos (max 10MB)
- **Customizable Conversion**: Adjust resolution and character sets for different ASCII effects
- **Real-time Preview**: See preview frames during conversion process
- **Full Playback Controls**: Play, pause, seek, volume control, and fullscreen mode
- **Color Support**: Preserves color information in the ASCII output for visually rich animations
- **Offline Support**: Works offline as a Progressive Web App (PWA)
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **PWA**: Service Worker with offline capabilities
- **Deployment**: GitHub Pages

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. The deployment happens automatically when changes are pushed to the main branch.

### Live Demo
The app is available at: https://progmars.github.io/ascii-video/

### Deployment Configuration
- **Base URL**: `/ascii-video/` (configured in `vite.config.ts`)
- **GitHub Actions**: Automatic deployment via `.github/workflows/deploy.yml`
- **Build Output**: Static files in `dist/` directory

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
