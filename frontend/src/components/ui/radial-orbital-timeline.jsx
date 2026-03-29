import { useState, useEffect, useRef } from 'react'

// Pure CSS/React version — no Tailwind, no shadcn deps needed
export default function RadialOrbitalTimeline({ timelineData }) {
  const [expandedItems, setExpandedItems] = useState({})
  const [rotationAngle, setRotationAngle] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [pulseEffect, setPulseEffect] = useState({})
  const [activeNodeId, setActiveNodeId] = useState(null)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  const containerRef = useRef(null)
  const nodeRefs = useRef({})

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateBounds = () => {
      setBounds({
        width: node.clientWidth,
        height: node.clientHeight,
      })
    }

    updateBounds()

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(updateBounds)
      observer.observe(node)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  useEffect(() => {
    if (!autoRotate) return
    const timer = setInterval(() => {
      setRotationAngle(prev => Number(((prev + 0.25) % 360).toFixed(3)))
    }, 50)
    return () => clearInterval(timer)
  }, [autoRotate])

  const toggleItem = (id) => {
    setExpandedItems(prev => {
      const next = {}
      Object.keys(prev).forEach(k => { next[parseInt(k)] = false })
      const opening = !prev[id]
      next[id] = opening
      if (opening) {
        setActiveNodeId(id)
        setAutoRotate(false)
        const item = timelineData.find(i => i.id === id)
        const pulse = {}
        if (item) item.relatedIds.forEach(r => { pulse[r] = true })
        setPulseEffect(pulse)
        // center it
        const idx = timelineData.findIndex(i => i.id === id)
        setRotationAngle(270 - (idx / timelineData.length) * 360)
      } else {
        setActiveNodeId(null)
        setAutoRotate(true)
        setPulseEffect({})
      }
      return next
    })
  }

  const calcPos = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360
    const minSide = Math.min(bounds.width || 360, bounds.height || 360)
    const radius = Math.min(170, Math.max(96, (minSide / 2) - (minSide < 360 ? 72 : 58)))
    const rad = (angle * Math.PI) / 180
    return {
      x: radius * Math.cos(rad),
      y: radius * Math.sin(rad),
      radius,
      zIndex: Math.round(100 + 50 * Math.cos(rad)),
      opacity: Math.max(0.35, Math.min(1, 0.35 + 0.65 * ((1 + Math.sin(rad)) / 2))),
    }
  }

  const getCardStyle = (pos) => {
    const compactLayout = (bounds.width || 0) < 640
    const cardWidth = compactLayout
      ? Math.min(200, Math.max(160, (bounds.width || 220) - 48))
      : 220

    if (pos.x > 45) {
      return {
        width: cardWidth,
        left: 'auto',
        right: '-20px',
        transform: 'none',
      }
    }

    if (pos.x < -45) {
      return {
        width: cardWidth,
        left: '-20px',
        transform: 'none',
      }
    }

    return { width: cardWidth }
  }

  const isRelated = (id) => {
    if (!activeNodeId) return false
    const active = timelineData.find(i => i.id === activeNodeId)
    return active ? active.relatedIds.includes(id) : false
  }

  const statusColor = (s) => s === 'completed' ? '#10b981' : s === 'in-progress' ? '#06b6d4' : '#64748b'
  const statusLabel = (s) => s === 'completed' ? 'DONE' : s === 'in-progress' ? 'IN PROGRESS' : 'PENDING'

  return (
    <div
      ref={containerRef}
      className="rot-container"
      onClick={e => {
        if (e.target === containerRef.current) {
          setExpandedItems({}); setActiveNodeId(null)
          setPulseEffect({}); setAutoRotate(true)
        }
      }}
    >
      {/* Center orb */}
      <div className="rot-orb">
        <div className="rot-orb-ring rot-orb-ring1" />
        <div className="rot-orb-ring rot-orb-ring2" />
        <div className="rot-orb-core" />
      </div>

      {/* Orbit ring */}
      <div
        className="rot-orbit-ring"
        style={{
          width: `${(calcPos(0, timelineData.length).radius || 170) * 2}px`,
          height: `${(calcPos(0, timelineData.length).radius || 170) * 2}px`,
        }}
      />

      {/* Nodes */}
      {timelineData.map((item, index) => {
        const pos = calcPos(index, timelineData.length)
        const expanded = !!expandedItems[item.id]
        const related = isRelated(item.id)
        const pulsing = !!pulseEffect[item.id]
        const Icon = item.icon

        return (
          <div
            key={item.id}
            ref={el => nodeRefs.current[item.id] = el}
            className="rot-node"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              zIndex: expanded ? 200 : pos.zIndex,
              opacity: expanded ? 1 : pos.opacity,
            }}
            onClick={e => { e.stopPropagation(); toggleItem(item.id) }}
          >
            {/* Energy aura */}
            {pulsing && (
              <div className="rot-aura" style={{
                width: item.energy * 0.4 + 40,
                height: item.energy * 0.4 + 40,
                marginLeft: -(item.energy * 0.4 + 40) / 2 + 20,
                marginTop: -(item.energy * 0.4 + 40) / 2 + 20,
              }} />
            )}

            {/* Node circle */}
            <div className={`rot-dot ${expanded ? 'rot-dot-active' : ''} ${related ? 'rot-dot-related' : ''}`}
              style={{ borderColor: expanded ? statusColor(item.status) : related ? '#fff' : 'rgba(255,255,255,0.35)' }}>
              <Icon size={14} />
            </div>

            {/* Label */}
            <div className={`rot-label ${expanded ? 'rot-label-active' : ''}`}>
              {item.title}
            </div>

            {/* Expanded card */}
            {expanded && (
              <div className="rot-card" style={getCardStyle(pos)} onClick={e => e.stopPropagation()}>
                <div className="rot-card-line" />
                <div className="rot-card-header">
                  <span className="rot-status-badge" style={{ background: statusColor(item.status) + '33', color: statusColor(item.status), borderColor: statusColor(item.status) + '66' }}>
                    {statusLabel(item.status)}
                  </span>
                  <span className="rot-card-date">{item.date}</span>
                </div>
                <div className="rot-card-title">{item.title}</div>
                <p className="rot-card-body">{item.content}</p>

                {/* Energy bar */}
                <div className="rot-energy">
                  <div className="rot-energy-header">
                    <span>⚡ Energy</span>
                    <span>{item.energy}%</span>
                  </div>
                  <div className="rot-energy-track">
                    <div className="rot-energy-fill" style={{ width: `${item.energy}%`, background: `linear-gradient(90deg, #3b82f6, ${statusColor(item.status)})` }} />
                  </div>
                </div>

                {/* Related nodes */}
                {item.relatedIds.length > 0 && (
                  <div className="rot-related">
                    <div className="rot-related-title">🔗 Connected</div>
                    <div className="rot-related-btns">
                      {item.relatedIds.map(rid => {
                        const rel = timelineData.find(i => i.id === rid)
                        return (
                          <button key={rid} className="rot-related-btn"
                            onClick={e => { e.stopPropagation(); toggleItem(rid) }}>
                            {rel?.title} →
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
