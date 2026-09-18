import { useState, useRef, useEffect } from 'react'
import './StoryPanel.css'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const MOVEMENT_OPTIONS = [
  { label: '— Select movement —', value: '' },
  { label: 'Static shot', value: 'Static shot', desc: 'locked-off static shot. Movement: hold one fixed camera position for the full clip. Speed: still and steady. Framing: keep the same angle, height, lens distance and composition. End: finish with the same framing and camera position.' },
  { label: 'Pan right', value: 'Pan right', desc: 'pan right. Movement: rotate the camera horizontally from left to right from one fixed point. Speed: smooth constant rotation. Framing: keep the horizon level while new space enters from the right side of the frame. End: settle on a clear final composition.' },
  { label: 'Pan left', value: 'Pan left', desc: 'pan left. Movement: rotate the camera horizontally from right to left from one fixed point. Speed: smooth constant rotation. Framing: keep the horizon level while new space enters from the left side of the frame. End: settle on a clear final composition.' },
  { label: 'Whip pan right', value: 'Whip pan right', desc: 'whip pan right. Movement: rotate rapidly from the starting direction toward a new target on the right. Speed: fast snap with brief motion blur during the rotation. Framing: begin on one readable composition and land on a second readable target. End: settle into a sharp final frame.' },
  { label: 'Whip pan left', value: 'Whip pan left', desc: 'whip pan left. Movement: rotate rapidly from the starting direction toward a new target on the left. Speed: fast snap with brief motion blur during the rotation. Framing: begin on one readable composition and land on a second readable target. End: settle into a sharp final frame.' },
  { label: 'Tilt up', value: 'Tilt up', desc: 'tilt up. Movement: rotate the camera upward from one fixed point. Speed: smooth constant tilt. Framing: keep the vertical subject or architecture centered as the frame travels upward. End: land on the upper target.' },
  { label: 'Tilt down', value: 'Tilt down', desc: 'tilt down. Movement: rotate the camera downward from one fixed point. Speed: smooth constant tilt. Framing: keep the vertical subject or architecture centered as the frame travels downward. End: land on the lower target.' },
  { label: 'Slow zoom in', value: 'Slow zoom in', desc: 'slow zoom in. Movement: slowly increase lens focal length toward a tighter frame. Speed: gradual and even. Framing: keep the main visual target readable as it becomes larger in frame. End: finish on a stable tighter composition.' },
  { label: 'Slow zoom out', value: 'Slow zoom out', desc: 'slow zoom out. Movement: slowly decrease lens focal length toward a wider frame. Speed: gradual and even. Framing: keep the main visual target readable as more surrounding space appears. End: finish on a stable wider composition.' },
  { label: 'Fast zoom in', value: 'Fast zoom in', desc: 'fast zoom in. Movement: quickly increase lens focal length toward the main visual target. Speed: quick decisive zoom. Framing: keep the target centered or clearly readable during the scale change. End: finish on a stable tighter composition.' },
  { label: 'Fast zoom out', value: 'Fast zoom out', desc: 'fast zoom out. Movement: quickly decrease lens focal length away from the main visual target. Speed: quick decisive zoom. Framing: keep the target readable as the surrounding space appears. End: finish on a stable wider composition.' },
  { label: 'Crash zoom in', value: 'Crash zoom in', desc: 'crash zoom in. Movement: snap the lens rapidly toward the main visual target. Speed: very fast and punchy. Framing: keep the target readable through the sudden scale change. End: land on a bold tighter composition.' },
  { label: 'Crash zoom out', value: 'Crash zoom out', desc: 'crash zoom out. Movement: snap the lens rapidly away from the main visual target. Speed: very fast and punchy. Framing: keep the target readable as the surrounding space appears. End: land on a bold wider composition.' },
  { label: 'Dolly in', value: 'Dolly in', desc: 'dolly in. Movement: move the camera physically forward in a straight line toward the main subject. Speed: smooth controlled push. Framing: keep camera height, lens direction and subject position consistent while distance closes. End: finish in a tighter composition.' },
  { label: 'Dolly out', value: 'Dolly out', desc: 'dolly out. Movement: move the camera physically backward in a straight line away from the main subject. Speed: smooth controlled retreat. Framing: keep lens direction and camera height consistent while more environment enters frame. End: finish in a wider composition.' },
  { label: 'Truck right', value: 'Truck right', desc: 'truck right. Movement: move the camera physically to the right on a straight horizontal path. Speed: smooth constant lateral travel. Framing: keep the lens facing the same direction while the scene slides across frame. End: finish on a clean lateral composition.' },
  { label: 'Truck left', value: 'Truck left', desc: 'truck left. Movement: move the camera physically to the left on a straight horizontal path. Speed: smooth constant lateral travel. Framing: keep the lens facing the same direction while the scene slides across frame. End: finish on a clean lateral composition.' },
  { label: 'Pedestal up', value: 'Pedestal up', desc: 'pedestal up. Movement: move the entire camera vertically upward in a straight line. Speed: smooth constant lift. Framing: keep the lens level and pointed in the same direction during the vertical move. End: finish with the higher framing clearly readable.' },
  { label: 'Pedestal down', value: 'Pedestal down', desc: 'pedestal down. Movement: move the entire camera vertically downward in a straight line. Speed: smooth constant descent. Framing: keep the lens level and pointed in the same direction during the vertical move. End: finish with the lower framing clearly readable.' },
  { label: 'Slider right', value: 'Slider right', desc: 'slider right. Movement: slide the camera a small distance to the right. Speed: slow controlled constant motion. Framing: keep foreground, subject and background layers readable as parallax shifts. End: finish on a refined composition with the new right-side angle visible.' },
  { label: 'Slider left', value: 'Slider left', desc: 'slider left. Movement: slide the camera a small distance to the left. Speed: slow controlled constant motion. Framing: keep foreground, subject and background layers readable as parallax shifts. End: finish on a refined composition with the new left-side angle visible.' },
  { label: 'Push past / pass-by', value: 'Push past / pass-by', desc: 'push past. Movement: move forward past a visible foreground object, edge or opening. Speed: smooth forward glide. Framing: let the foreground pass close to the lens while the space beyond becomes clearer. End: arrive inside or beyond the foreground layer.' },
  { label: 'Arc right', value: 'Arc right', desc: 'arc right. Movement: move on a shallow curved path around the main subject toward the right side. Speed: smooth measured curve. Framing: keep distance, height and subject readability consistent while the angle changes. End: finish from a new right-side angle.' },
  { label: 'Arc left', value: 'Arc left', desc: 'arc left. Movement: move on a shallow curved path around the main subject toward the left side. Speed: smooth measured curve. Framing: keep distance, height and subject readability consistent while the angle changes. End: finish from a new left-side angle.' },
  { label: 'Orbit clockwise', value: 'Orbit clockwise', desc: 'clockwise orbit. Movement: circle clockwise around the main subject at a consistent radius. Speed: smooth controlled orbit. Framing: keep the subject centered while the background rotates around them. End: complete the intended arc or full circle with stable framing.' },
  { label: 'Orbit counterclockwise', value: 'Orbit counterclockwise', desc: 'counterclockwise orbit. Movement: circle counterclockwise around the main subject at a consistent radius. Speed: smooth controlled orbit. Framing: keep the subject centered while the background rotates around them. End: complete the intended arc or full circle with stable framing.' },
  { label: 'Tracking shot', value: 'Tracking shot', desc: 'tracking shot. Movement: move through the scene with the main subject. Speed: match the subject\'s pace. Framing: keep the subject consistently readable while the environment moves around them. End: maintain a clear moving composition.' },
  { label: 'Follow shot', value: 'Follow shot', desc: 'follow shot from behind. Movement: move behind the subject along their route at shoulder height. Speed: match the subject\'s pace. Framing: keep the back, shoulder or head as the foreground guide while the route ahead stays readable. End: continue following with the subject leading the frame.' },
  { label: 'Reverse tracking', value: 'Reverse tracking', desc: 'reverse tracking shot. Movement: move backward in front of the walking subject. Speed: match the subject\'s forward pace. Framing: keep front-facing face and body framing stable as the background moves behind them. End: hold a clear front-facing moving composition.' },
  { label: 'Side tracking', value: 'Side tracking', desc: 'side tracking shot. Movement: move parallel beside the subject along their direction of travel. Speed: match the subject\'s motion. Framing: keep the subject in side profile or three-quarter profile at a stable distance. End: continue the parallel movement with clear horizontal motion.' },
  { label: 'Low tracking', value: 'Low tracking', desc: 'low tracking shot. Movement: move at ground or below-waist height alongside the subject\'s movement path. Speed: match the subject, footsteps or wheels. Framing: keep the low detail readable while the ground plane moves through frame. End: finish with the low perspective clearly maintained.' },
  { label: 'Vehicle tracking', value: 'Vehicle tracking', desc: 'vehicle tracking shot. Movement: move with the vehicle along its route. Speed: match the vehicle\'s pace. Framing: keep the vehicle stable in frame while the road or environment moves past. End: maintain a clear moving vehicle composition.' },
  { label: 'Chase shot', value: 'Chase shot', desc: 'chase shot. Movement: follow a moving subject quickly along the action route. Speed: fast, reactive and physically close. Framing: keep the subject visible while allowing energetic reframing. End: stay connected to the subject in motion.' },
  { label: 'Handheld shot', value: 'Handheld shot', desc: 'handheld shot. Movement: hold the camera at human operator height with natural body movement. Speed: responsive and organic. Framing: keep the subject readable while the frame has subtle sway and micro-adjustments. End: finish with a natural handheld composition.' },
  { label: 'Body-mounted / Snorricam', value: 'Body-mounted / Snorricam', desc: 'body-mounted Snorricam. Movement: keep the camera fixed relative to the subject\'s torso or face while the subject moves. Speed: match the subject\'s body motion. Framing: keep the subject close, centered and facing the camera as the background moves around them. End: finish with the subject still locked in frame.' },
  { label: 'Crane up', value: 'Crane up', desc: 'crane up. Movement: travel smoothly upward through open space. Speed: slow controlled vertical lift. Framing: keep the subject or location readable as the camera rises. End: finish with the higher scale clearly visible.' },
  { label: 'Crane down', value: 'Crane down', desc: 'crane down. Movement: travel smoothly downward through open space. Speed: slow controlled vertical descent. Framing: keep the subject or location readable as the camera descends. End: finish with the lower subject or destination clearly visible.' },
  { label: 'Drone push in', value: 'Drone push in', desc: 'drone push in. Movement: fly smoothly forward through open space toward the subject or destination. Speed: controlled aerial glide. Framing: keep the route and destination readable as the camera approaches. End: arrive at a closer aerial composition.' },
  { label: 'Drone pull back', value: 'Drone pull back', desc: 'drone pull back. Movement: fly smoothly backward away from the subject or destination. Speed: controlled aerial retreat. Framing: keep the subject readable as more landscape appears. End: finish on a wider aerial composition.' },
  { label: 'Helicopter shot', value: 'Helicopter shot', desc: 'helicopter-style aerial shot. Movement: move from high altitude along a broad gradual flight path. Speed: steady controlled aerial motion. Framing: keep the landscape or distant moving subject readable at wide scale. End: finish on a stable high-altitude composition.' },
  { label: 'First-person view', value: 'First-person view', desc: 'first-person view. Movement: move forward at human eye height from the character\'s perspective. Speed: natural walking or reaching pace. Framing: use visible hands, arms or body edges as the viewer\'s physical reference. End: arrive at the next point of action from the same point of view.' },
  { label: 'Tilt-shift', value: 'Tilt-shift', desc: 'tilt-shift miniature view. Movement: hold or glide from a high angled view over the scene. Speed: small precise movement. Framing: keep a narrow band of sharp focus across the key subject area with soft blur above and below. End: finish with the miniature-scale view intact.' },
  { label: 'Infinite zoom', value: 'Infinite zoom', desc: 'infinite zoom. Movement: zoom continuously inward toward the exact center target. Speed: smooth accelerating zoom. Framing: keep the circular target centered as it expands. End: finish when the next visual world fills the frame.' },
  { label: 'Earth zoom out', value: 'Earth zoom out', desc: 'earth zoom out. Movement: pull upward from the starting point through street, city, landscape and planet scale. Speed: rapid expanding zoom out. Framing: keep the original location centered as scale grows. End: finish on a planet-scale view with the starting point still implied at center.' },
  { label: 'Time-lapse', value: 'Time-lapse', desc: 'locked-camera time-lapse. Movement: hold one fixed camera position while time moves rapidly forward. Speed: fast time compression with a stable camera. Framing: keep the same composition and horizon as motion passes through the frame. End: finish from the same camera angle with visible passage of time.' },
  { label: 'Pass-through objects', value: 'Pass-through objects', desc: 'pass-through movement. Movement: move forward toward a visible object, surface or barrier and continue into the space beyond. Speed: smooth centered glide. Framing: keep the opening or surface centered as the transition point. End: arrive inside the revealed space beyond.' },
]

const LIGHTING_OPTIONS = [
  { label: '— Select lighting —', value: '' },
  { label: 'Softbox lighting', value: 'Softbox lighting', desc: 'large softbox key light at 45 degrees, soft wrap, subtle fill, clean shadow edges. Soft, flattering light with gentle shadows. Clean, modern studio vibe.' },
  { label: 'Soft diffused studio', value: 'Soft diffused studio', desc: 'soft diffused studio lighting, even exposure, gentle highlights, minimal harsh shadows. Even, flattering studio light.' },
  { label: 'Softbox with reflector', value: 'Softbox with reflector', desc: 'softbox key light camera-left, reflector fill camera-right, natural skin tones. Clean, professional portrait light.' },
  { label: 'Rim light', value: 'Rim light', desc: 'rim light from behind, clean edge highlight around hair and shoulders, controlled spill. Strong subject separation from background. Premium, cinematic polish.' },
  { label: 'Rim light + low key', value: 'Rim light + low key', desc: 'low key setup with strong rim light behind subject, clean edge highlights, minimal spill. Dramatic dark-background separation.' },
  { label: 'Key + strong rim', value: 'Key + strong rim', desc: 'key light soft, plus strong rim light behind subject, high contrast separation. Flattering face light with bold edge definition.' },
  { label: 'Rembrandt lighting', value: 'Rembrandt lighting', desc: 'Rembrandt lighting, single key light high and to the side, dramatic contrast, triangle cheek highlight. Classic dramatic portrait lighting. One side brighter, the other in shadow with a small triangle of light on the shadow cheek.' },
  { label: 'Chiaroscuro portrait', value: 'Chiaroscuro portrait', desc: 'chiaroscuro portrait lighting, deep shadows, soft falloff, warm highlights. Classic art-inspired dramatic contrast.' },
  { label: 'Single key 45 degrees', value: 'Single key 45 degrees', desc: 'one key light at 45 degrees and slightly above, controlled fill, moody contrast. Simple, dramatic single-source setup.' },
  { label: 'Neon lighting', value: 'Neon lighting', desc: 'neon signs casting colored light, magenta and cyan mix, reflective highlights, soft bloom. Colored light sources with glow and reflections. Cyberpunk, nightlife, street portrait energy.' },
  { label: 'Urban neon glow', value: 'Urban neon glow', desc: 'urban neon glow, colored rim light, wet street reflections, cinematic night lighting. Night street scene with vibrant color.' },
  { label: 'Neon tube lighting', value: 'Neon tube lighting', desc: 'neon tube lighting, vibrant color contrast, controlled highlights, realistic skin tones. Vivid colored light with natural skin.' },
  { label: 'Natural window light', value: 'Natural window light', desc: 'one large north-facing window camera-left, broad diffused daylight, soft shadow transition, low neutral room fill, natural catchlights, realistic highlight rolloff, no studio flash. Best for candid portraits, food, interiors, lifestyle.' },
  { label: 'High-key studio', value: 'High-key studio', desc: 'high-key white studio, large frontal soft key, balanced fill from both sides, evenly lit background one stop brighter than the subject, restrained shadow depth, clean whites without clipped highlights. Best for ecommerce, beauty, wellness, bright editorial.' },
  { label: 'Low-key dramatic', value: 'Low-key dramatic', desc: 'low-key setup with one narrow soft key high camera-right, deep but detailed shadows, minimal fill, subtle edge separation, dark background, controlled specular highlights, no crushed detail. Best for cinematic portraits, premium products, album art, suspense.' },
  { label: 'Split lighting', value: 'Split lighting', desc: 'split lighting with one vertical soft key exactly 90 degrees camera-left, one half of the face illuminated and the other half in controlled shadow, low fill, sharp eye detail, neutral background, no second key light. Best for bold character portraits, musicians, athletes.' },
  { label: 'Golden-hour backlight', value: 'Golden-hour backlight', desc: 'low golden-hour sun behind the subject camera-right, warm hair and shoulder backlight, soft sky fill on the face, long coherent shadows, restrained lens flare, natural skin tone, visible detail in highlights. Best for outdoor portraits, travel, couples, fashion.' },
  { label: 'Product lighting', value: 'Product lighting', desc: 'broad strip softbox upper-left defining the product edge, white-card fill camera-right, soft overhead gradient, clean contact shadow, reflections that follow the material, accurate label color, no blown highlights, no floating product. Best for packaging, cosmetics, bottles, electronics.' },
  { label: 'Flat fix: add contrast', value: 'Flat fix: add contrast', desc: 'increase contrast, deeper shadows, reduce fill, add subtle rim light separation. Use when the image looks flat.' },
  { label: 'Harsh fix: add diffusion', value: 'Harsh fix: add diffusion', desc: 'soft diffused lighting, gentle falloff, soft wrap, no harsh shadows. Use when the image looks too harsh.' },
  { label: 'Muddy fix: clean highlights', value: 'Muddy fix: clean highlights', desc: 'clean highlights, deeper blacks, crisp separation, minimal haze, natural contrast. Use when the image looks muddy or gray.' },
  { label: 'Random direction fix', value: 'Random direction fix', desc: 'single key light from camera-left at 45 degrees, minimal fill, consistent shadow direction. Use when light direction feels random.' },
]

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

  const handleMovementChange = (e) => {
    const val = e.target.value
    const opt = MOVEMENT_OPTIONS.find(o => o.value === val)
    handleField('movement', val)
    handleField('movementDesc', opt?.desc || '')
  }

  const handleLightingChange = (e) => {
    const val = e.target.value
    const opt = LIGHTING_OPTIONS.find(o => o.value === val)
    handleField('lighting', val)
    handleField('lightingDesc', opt?.desc || '')
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

        <button className="add-extra-btn" onClick={() => extraRef.current?.click()} title="Add additional image">
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
        <select
          className="movement-select"
          value={panel.movement || ''}
          onChange={handleMovementChange}
        >
          {MOVEMENT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {panel.movementDesc && (
          <div className="movement-desc">{panel.movementDesc}</div>
        )}
      </td>
      <td className="sb-lighting">
        <select
          className="movement-select"
          value={panel.lighting || ''}
          onChange={handleLightingChange}
        >
          {LIGHTING_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {panel.lightingDesc && (
          <div className="movement-desc">{panel.lightingDesc}</div>
        )}
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
