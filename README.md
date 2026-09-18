# Storyboard

A React-based storyboard application for planning video scenes with AI assistance.

## Features

- 6-shot table layout with professional camera controls per row
- Main image + multiple additional images (characters, props) per shot
- Camera dropdowns: height, framing, angle, position, lens, 3D space, resolution
- 40+ camera movement options with paste-ready descriptions
- 22 lighting presets (softbox, rim, neon, golden-hour, etc.)
- Action, sound cue, and time fields per shot
- AI integration (LM Studio, Ollama, or any OpenAI-compatible API)
- AI skips empty scenes — only filled shots are sent to the AI
- Upload custom prompt templates (.md files), saved to localStorage
- 6 color themes (Midnight, Warm, Forest, Ocean, Rose, Minimal)
- Export as composite PNG shot list + TXT prompts file
- All settings persist in localStorage (endpoint, model, prompt, theme)
- Video model selector with checkmark badge
- Import text files to auto-populate action fields

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
2. Set your AI endpoint (default: `http://localhost:1234` for LM Studio)
3. Set your model name (e.g., `google/gemma-4-e2b`)
4. Optionally upload a `.md` prompt template (auto-saved)
5. Go back to **Storyboard** and click **Run AI on All Shots**

### Supported APIs

- **LM Studio** - `http://localhost:1234` (auto-detects `/v1/chat/completions`)
- **Ollama** - `http://localhost:11434/api/generate`
- **OpenAI-compatible** - Any `/v1/chat/completions` endpoint

The app auto-detects the correct API path based on the port. Just enter the base URL.

## Export

Click **Export PNG + TXT** to download:

- **`{title}_shots.png`** — Single composite image with shot list layout: shot number on the left, main image large on the right, thumbnails below, with image count label
- **`{title}_prompts.txt`** — Text file with all shot details (camera, movement, lighting, action, sound) and AI prompts organized by shot number

## Security Notes

- Image uploads validated for type (JPG, PNG, GIF, WebP) and size (max 5MB)
- Text imports limited to 100KB
- Prompt injection protection on AI inputs
- Filenames are sanitized
- Endpoint URLs validated (localhost only by default)

## Tech Stack

- React 19
- Vite
- No external UI libraries
- Canvas API for PNG export
