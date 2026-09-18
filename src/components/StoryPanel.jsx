import { useState, useRef, useEffect } from 'react'
import './StoryPanel.css'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid type'
  if (file.size > MAX_IMAGE_SIZE) return 'Max 5MB'
  return null
}

export default function StoryPanel({ panel, onUpdate, panelNumber }) {
  const [imageUrl, setImageUrl] = useState(panel.imageUrl || '')
  const [extraImages, setExtraImages] = useState(panel.extraImages || [])
  const [imageError, setImageError] = useState('')
  const mainRef = useRef(null)
  const extraRef = useRef(null)
  const cleanupRef = useRef({ url: '', extras: [] })

  useEffect(() => {
    cleanupRef.current = { url: imageUrl, extras: extraImages }
  }, [imageUrl, extraImages])

  useEffect(() => {
    return () => {
      const { url, extras } = cleanupRef.current
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
      extras.forEach(img => { if (img.url?.startsWith('blob:')) URL.revokeObjectURL(img.url) })
    }
  }, [])

  const handleMainUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const err = validateFile(file)
    if (err) { setImageError(err); return }
    setImageError('')
    if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    onUpdate({ ...panel, imageUrl: url, imageFile: file, imageName: file.name })
  }

  const handleExtraUpload = (e) => {
    const files = Array.from(e.target.files)
    const newExtras = []
    for (const file of files) {
      const err = validateFile(file)
      if (err) { setImageError(err); continue }
      setImageError('')
      const url = URL.createObjectURL(file)
      newExtras.push({ url, file, name: file.name, id: Date.now() + Math.random() })
    }
    if (newExtras.length > 0) {
      setExtraImages(prev => {
        const updated = [...prev, ...newExtras]
        onUpdate({ ...panel, extraImages: updated })
        return updated
      })
    }
  }

  const removeExtra = (id) => {
    setExtraImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.url?.startsWith('blob:')) URL.revokeObjectURL(img.url)
      const updated = prev.filter(i => i.id !== id)
      onUpdate({ ...panel, extraImages: updated })
      return updated
    })
  }

  const handlePaste = (e) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (!ALLOWED_TYPES.includes(file.type)) { setImageError('Unsupported type'); return }
        if (file.size > MAX_IMAGE_SIZE) { setImageError('Too large (max 5MB)'); return }
        setImageError('')
        const url = URL.createObjectURL(file)
        if (!imageUrl) {
          setImageUrl(url)
          onUpdate({ ...panel, imageUrl: url, imageFile: file, imageName: 'Pasted image' })
        } else {
          const newImg = { url, file, name: 'Pasted image', id: Date.now() + Math.random() }
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

  const clearMain = () => {
    if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    setImageUrl('')
    onUpdate({ ...panel, imageUrl: '', imageFile: null, imageName: '' })
  }

  const handleField = (field, value) => {
    onUpdate({ ...panel, [field]: value })
  }

  const totalImages = (imageUrl ? 1 : 0) + extraImages.length

  return (
    <tr className="sb-row" onPaste={handlePaste}>
      <td className="sb-shot">
        <div className="shot-number">{panelNumber}</div>
        <input
          type="text"
          value={panel.shotName || ''}
          onChange={(e) => handleField('shotName', e.target.value)}
          placeholder="Shot name"
          className="shot-name-input"
          maxLength={50}
        />
      </td>
      <td className="sb-image">
        {imageUrl ? (
          <div className="image-cell">
            <img src={imageUrl} alt={`Shot ${panelNumber}`} />
            <button className="clear-btn" onClick={clearMain} title="Remove">✕</button>
          </div>
        ) : (
          <div className="image-drop" onClick={() => mainRef.current?.click()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            <span>Main image</span>
          </div>
        )}
        <input ref={mainRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleMainUpload} style={{ display: 'none' }} />

        {extraImages.length > 0 && (
          <div className="extra-strip">
            {extraImages.map(img => (
              <div key={img.id} className="extra-thumb">
                <img src={img.url} alt={img.name} />
                <button className="extra-remove" onClick={() => removeExtra(img.id)} title="Remove">✕</button>
                <span className="extra-label">{img.name}</span>
              </div>
            ))}
          </div>
        )}

        <button className="add-extra-btn" onClick={() => extraRef.current?.click()} title="Add additional image (character, prop, etc.)">
          + Add image ({totalImages})
        </button>
        <input ref={extraRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple onChange={handleExtraUpload} style={{ display: 'none' }} />
        {imageError && <span className="img-err">{imageError}</span>}
      </td>
      <td className="sb-time">
        <input
          type="text"
          value={panel.time || ''}
          onChange={(e) => handleField('time', e.target.value)}
          placeholder="0:00 - 0:01"
          className="cell-input"
          maxLength={30}
        />
        <input
          type="text"
          value={panel.duration || ''}
          onChange={(e) => handleField('duration', e.target.value)}
          placeholder="(1 sec)"
          className="cell-input sub"
          maxLength={20}
        />
      </td>
      <td className="sb-camera">
        <textarea
          value={panel.camera || ''}
          onChange={(e) => handleField('camera', e.target.value)}
          placeholder="WIDE ESTABLISHING&#10;16:9 - Heroic landscape"
          className="cell-textarea"
          rows={3}
          maxLength={300}
        />
      </td>
      <td className="sb-movement">
        <textarea
          value={panel.movement || ''}
          onChange={(e) => handleField('movement', e.target.value)}
          placeholder="SLOW DRONE&#10;PUSH-IN"
          className="cell-textarea"
          rows={3}
          maxLength={300}
        />
      </td>
      <td className="sb-lighting">
        <textarea
          value={panel.lighting || ''}
          onChange={(e) => handleField('lighting', e.target.value)}
          placeholder="GOLDEN HOUR&#10;Natural warm light"
          className="cell-textarea"
          rows={3}
          maxLength={300}
        />
      </td>
      <td className="sb-action">
        <textarea
          value={panel.action || ''}
          onChange={(e) => handleField('action', e.target.value)}
          placeholder="Scene description..."
          className="cell-textarea"
          rows={3}
          maxLength={500}
        />
      </td>
      <td className="sb-transition">
        <input
          type="text"
          value={panel.transition || ''}
          onChange={(e) => handleField('transition', e.target.value)}
          placeholder="DISSOLVE"
          className="cell-input"
          maxLength={50}
        />
      </td>
      <td className="sb-sound">
        <input
          type="text"
          value={panel.sound || ''}
          onChange={(e) => handleField('sound', e.target.value)}
          placeholder="EPIC RISE&#10;Orchestral swell"
          className="cell-input"
          maxLength={100}
        />
      </td>
    </tr>
  )
}
