import { useState, useRef } from 'react'
import './StoryPanel.css'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Allowed: JPG, PNG, GIF, WebP'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `File too large. Max size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
  }
  return null
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function StoryPanel({ panel, onUpdate, panelNumber }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(panel.text || '')
  const [mainImage, setMainImage] = useState(panel.mainImage || null)
  const [mainImageName, setMainImageName] = useState(panel.mainImageName || '')
  const [extraImages, setExtraImages] = useState(panel.extraImages || [])
  const [imageError, setImageError] = useState('')
  const textAreaRef = useRef(null)
  const mainFileRef = useRef(null)
  const extraFileRef = useRef(null)

  const handleTextChange = (e) => {
    const newText = e.target.value
    setText(newText)
    onUpdate({ ...panel, text: newText })
  }

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const error = validateImageFile(file)
    if (error) {
      setImageError(error)
      return
    }
    setImageError('')
    const dataUrl = await readFileAsDataURL(file)
    setMainImage(dataUrl)
    setMainImageName(file.name)
    onUpdate({ ...panel, mainImage: dataUrl, mainImageName: file.name })
  }

  const handleExtraImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      const error = validateImageFile(file)
      if (error) {
        setImageError(error)
        continue
      }
      const dataUrl = await readFileAsDataURL(file)
      const newImg = { src: dataUrl, name: file.name, id: Date.now() + Math.random() }
      setExtraImages(prev => {
        const updated = [...prev, newImg]
        onUpdate({ ...panel, extraImages: updated })
        return updated
      })
    }
    setImageError('')
  }

  const removeExtraImage = (id) => {
    setExtraImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      onUpdate({ ...panel, extraImages: updated })
      return updated
    })
  }

  const handlePaste = async (e) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          setImageError('Pasted image type not supported')
          return
        }
        if (file.size > MAX_IMAGE_SIZE) {
          setImageError('Pasted image too large (max 5MB)')
          return
        }
        setImageError('')
        const dataUrl = await readFileAsDataURL(file)
        if (!mainImage) {
          setMainImage(dataUrl)
          setMainImageName('Pasted image')
          onUpdate({ ...panel, mainImage: dataUrl, mainImageName: 'Pasted image' })
        } else {
          const newImg = { src: dataUrl, name: 'Pasted image', id: Date.now() + Math.random() }
          setExtraImages(prev => {
            const updated = [...prev, newImg]
            onUpdate({ ...panel, extraImages: updated })
            return updated
          })
        }
        break
      }
    }
  }

  const clearMainImage = () => {
    setMainImage(null)
    setMainImageName('')
    onUpdate({ ...panel, mainImage: null, mainImageName: '' })
  }

  return (
    <div className="story-panel" onPaste={handlePaste}>
      <div className="panel-header">
        <span className="panel-number">Panel {panelNumber}</span>
      </div>
      <div className="panel-content">
        <div className="panel-main-image">
          {mainImage ? (
            <div className="image-preview">
              <img src={mainImage} alt={`Panel ${panelNumber}`} />
              <div className="image-overlay">
                <button className="clear-btn" onClick={clearMainImage} title="Remove image">✕</button>
              </div>
              <span className="image-name">{mainImageName}</span>
            </div>
          ) : (
            <div className="image-placeholder" onClick={() => mainFileRef.current?.click()}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              <span>Main image - click or paste</span>
            </div>
          )}
          <input
            ref={mainFileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleMainImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="panel-extra-images">
          <div className="extra-images-header">
            <span>Additional Images</span>
            <button className="add-extra-btn" onClick={() => extraFileRef.current?.click()} title="Add image">+</button>
          </div>
          <div className="extra-images-grid">
            {extraImages.map((img) => (
              <div key={img.id} className="extra-thumb">
                <img src={img.src} alt={img.name} />
                <button className="extra-remove" onClick={() => removeExtraImage(img.id)} title="Remove">✕</button>
                <span className="extra-name">{img.name}</span>
              </div>
            ))}
            <div className="extra-add-slot" onClick={() => extraFileRef.current?.click()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
          <input
            ref={extraFileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleExtraImageUpload}
            style={{ display: 'none' }}
          />
        </div>

        {imageError && <div className="image-error">{imageError}</div>}

        <div className="panel-text-box">
          <textarea
            ref={textAreaRef}
            value={text}
            onChange={handleTextChange}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Enter scene description..."
            className={isEditing ? 'editing' : ''}
            maxLength={5000}
          />
        </div>
      </div>
    </div>
  )
}
