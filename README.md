# Storyboard

A React-based storyboard application for planning video scenes with AI assistance.

## Features

- 9-panel grid with main image + additional images per panel
- Editable title and chapter name
- Text descriptions per panel
- AI integration (Ollama, LM Studio, or any OpenAI-compatible API)
- Upload custom prompt templates (.md files)
- 6 color themes
- Export storyboard as JSON (includes images + prompt)
- Import text files to auto-populate panels

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Or double-click `start.bat` on Windows.

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## AI Setup

1. Go to **Settings** tab
2. Set your AI endpoint (default: Ollama at `http://localhost:11434/api/generate`)
3. Set your model name (e.g., `llama3`)
4. Optionally upload a `.md` prompt template
5. Go back to **Storyboard** and click **Run AI**

### Supported APIs

- **Ollama** - `http://localhost:11434/api/generate`
- **LM Studio** - `http://localhost:1234/v1/chat/completions`
- **OpenAI-compatible** - Any `/v1/chat/completions` endpoint

## Security Notes

- Image uploads are validated for type (JPG, PNG, GIF, WebP) and size (max 5MB)
- Text imports limited to 100KB
- AI prompts are sanitized against prompt injection
- Export size capped at 50MB
- Filenames are sanitized

## Tech Stack

- React 19
- Vite
- No external UI libraries
