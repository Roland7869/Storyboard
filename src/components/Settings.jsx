import { useState, useRef, useEffect } from 'react'
import './Settings.css'

const colorSchemes = {
  midnight: { name: 'Midnight', bg: '#0d0d1a', headerBg: '#111127', panelBg: '#1a1a2e', borderColor: '#2a2a4a', borderHover: '#4a4a7a', text: '#e0e0e0', textDim: '#4a4a6a', accent: '#7c83ff' },
  warm: { name: 'Warm', bg: '#1a1210', headerBg: '#2a1e18', panelBg: '#2e221c', borderColor: '#4a3a2e', borderHover: '#7a5a4a', text: '#f0e0d0', textDim: '#6a5a4a', accent: '#ff8c42' },
  forest: { name: 'Forest', bg: '#0d1a0f', headerBg: '#112714', panelBg: '#1a2e1c', borderColor: '#2a4a2c', borderHover: '#4a7a4c', text: '#d0f0d0', textDim: '#4a6a4c', accent: '#42c96a' },
  ocean: { name: 'Ocean', bg: '#0d1a1a', headerBg: '#112727', panelBg: '#1a2e2e', borderColor: '#2a4a4a', borderHover: '#4a7a7a', text: '#d0f0f0', textDim: '#4a6a6a', accent: '#42b4c9' },
  rose: { name: 'Rose', bg: '#1a0d14', headerBg: '#271120', panelBg: '#2e1a26', borderColor: '#4a2a3c', borderHover: '#7a4a6a', text: '#f0d0e0', textDim: '#6a4a5c', accent: '#c94290' },
  minimal: { name: 'Minimal', bg: '#f5f5f5', headerBg: '#ffffff', panelBg: '#ffffff', borderColor: '#e0e0e0', borderHover: '#cccccc', text: '#222222', textDim: '#999999', accent: '#333333' },
}

const MAX_PROMPT_SIZE = 100 * 1024
const STORAGE_KEY = 'storyboard_settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveSettings(settings) {
  try {
    const toSave = { ...settings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch { /* ignore */ }
}

export default function Settings({ settings, onUpdate }) {
  const saved = loadSettings()
  const [aiEndpoint, setAiEndpoint] = useState(settings.aiEndpoint || saved?.aiEndpoint || 'http://localhost:11434/api/generate')
  const [aiModel, setAiModel] = useState(settings.aiModel || saved?.aiModel || 'llama3')
  const [apiKey, setApiKey] = useState(settings.apiKey || saved?.apiKey || '')
  const [colorScheme, setColorScheme] = useState(settings.colorScheme || saved?.colorScheme || 'midnight')
  const [promptFileName, setPromptFileName] = useState(settings.promptFileName || saved?.promptFileName || '')
  const [promptContent, setPromptContent] = useState(settings.promptContent || saved?.promptContent || '')
  const [showPrompt, setShowPrompt] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const handleEndpointChange = (e) => {
    setAiEndpoint(e.target.value)
    const updated = { ...settings, aiEndpoint: e.target.value }
    onUpdate(updated)
    saveSettings(updated)
  }

  const handleModelChange = (e) => {
    setAiModel(e.target.value)
    const updated = { ...settings, aiModel: e.target.value }
    onUpdate(updated)
    saveSettings(updated)
  }

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value)
    const updated = { ...settings, apiKey: e.target.value }
    onUpdate(updated)
    saveSettings(updated)
  }

  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme)
    const updated = { ...settings, colorScheme: scheme }
    onUpdate(updated)
    saveSettings(updated)
  }

  const handlePromptUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.md')) { alert('Only .md files are allowed'); return }
    if (file.size > MAX_PROMPT_SIZE) { alert(`Max ${MAX_PROMPT_SIZE / 1024}KB`); return }
    const reader = new FileReader()
    reader.onloadend = () => {
      setPromptContent(reader.result)
      setPromptFileName(file.name)
      const updated = { ...settings, promptFileName: file.name, promptContent: reader.result }
      onUpdate(updated)
      saveSettings(updated)
      setSavedNotice(true)
      setTimeout(() => setSavedNotice(false), 2000)
    }
    reader.readAsText(file)
  }

  const clearPrompt = () => {
    setPromptContent('')
    setPromptFileName('')
    const updated = { ...settings, promptFileName: '', promptContent: '' }
    onUpdate(updated)
    saveSettings(updated)
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>AI Provider</h3>
        <p className="section-desc">Connect to a local AI endpoint (Ollama, LM Studio, etc.)</p>

        <div className="setting-group">
          <label htmlFor="ai-endpoint">API Endpoint</label>
          <input id="ai-endpoint" type="text" value={aiEndpoint} onChange={handleEndpointChange} placeholder="http://localhost:11434/api/generate" maxLength={500} />
          <span className="setting-hint">Ollama: http://localhost:11434/api/generate | LM Studio: http://localhost:1234/v1/chat/completions</span>
        </div>

        <div className="setting-group">
          <label htmlFor="ai-model">Model Name</label>
          <input id="ai-model" type="text" value={aiModel} onChange={handleModelChange} placeholder="llama3" maxLength={100} />
          <span className="setting-hint">e.g., llama3, mistral, codellama</span>
        </div>

        <div className="setting-group">
          <label htmlFor="api-key">API Key (optional)</label>
          <input id="api-key" type="password" value={apiKey} onChange={handleApiKeyChange} placeholder="Leave blank for local AI" />
        </div>
      </div>

      <div className="settings-section">
        <h3>Color Scheme</h3>
        <p className="section-desc">Choose a color theme for the storyboard</p>
        <div className="color-schemes">
          {Object.entries(colorSchemes).map(([key, scheme]) => (
            <button key={key} className={`scheme-btn ${colorScheme === key ? 'active' : ''}`} onClick={() => handleColorSchemeChange(key)}>
              <span className="scheme-preview" style={{ background: `linear-gradient(135deg, ${scheme.bg} 50%, ${scheme.panelBg} 50%)`, border: `2px solid ${scheme.borderColor}` }} />
              <span className="scheme-label">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Video Creation Prompt</h3>
        <p className="section-desc">Upload a .md file containing your video creation prompt template. Saved automatically.</p>

        <div className="prompt-upload-row">
          <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {promptFileName ? `Change: ${promptFileName}` : 'Upload Prompt (.md)'}
          </button>
          <input ref={fileInputRef} type="file" accept=".md" onChange={handlePromptUpload} style={{ display: 'none' }} />
          {promptContent && (
            <button className="clear-prompt-btn" onClick={clearPrompt}>Remove</button>
          )}
        </div>

        {savedNotice && <div className="saved-notice">Saved</div>}

        {promptFileName && (
          <div className="prompt-status">
            <span className="prompt-check">✓</span>
            <span className="prompt-filename">{promptFileName}</span>
            <span className="prompt-size">{Math.round(promptContent.length / 1024)}KB</span>
          </div>
        )}

        {promptContent && (
          <div className="prompt-preview">
            <div className="prompt-header">
              <span>Prompt Preview</span>
              <button className="toggle-btn" onClick={() => setShowPrompt(!showPrompt)}>
                {showPrompt ? 'Hide' : 'Show'}
              </button>
            </div>
            {showPrompt && <pre className="prompt-content">{promptContent}</pre>}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>Prompt Template Variables</h3>
        <p className="section-desc">Use these variables in your prompt template:</p>
        <div className="variables-list">
          <code>{'{{shot_number}}'}</code> — The shot number (1-6)<br />
          <code>{'{{shot_data}}'}</code> — Full shot data (camera, movement, lighting, etc.)<br />
          <code>{'{{title}}'}</code> — The storyboard title<br />
          <code>{'{{chapter}}'}</code> — The chapter name<br />
          <code>{'{{video_model}}'}</code> — The selected video model (Kling, Veo, etc.)
        </div>
      </div>
    </div>
  )
}
