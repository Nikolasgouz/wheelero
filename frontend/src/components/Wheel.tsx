import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { freezeWheel } from '../lib/motion'
import { indexAtPointer, sectorPath } from '../lib/geometry'
import { sectorColors, textColor } from '../lib/presentation'
import type { Customization } from '../customization'
import { t } from '../i18n'
import type { Option } from '../types'

export function Wheel({
  options,
  rotation,
  spinning,
  config,
  winnerId,
  svg,
  idle,
  canSpin,
  onSpin,
}: {
  options: Option[]
  rotation: number
  spinning: boolean
  config: Customization
  winnerId: string | null
  svg: RefObject<SVGSVGElement | null>
  idle: boolean
  canSpin: boolean
  onSpin: () => void
}) {
  const pointer = useRef<HTMLDivElement>(null)
  const count = options.length
  const colors = useMemo(() => sectorColors(count, config.palette), [count, config.palette])
  useEffect(() => {
    if (!idle) return
    const node = svg.current!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const start = () => {
      const angle = freezeWheel(node)
      if (!reduced.matches)
        node.animate(
          [{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${angle + 360}deg)` }],
          { duration: 30000, iterations: Infinity, easing: 'linear' },
        )
    }
    start()
    reduced.addEventListener('change', start)
    return () => {
      reduced.removeEventListener('change', start)
      freezeWheel(node)
    }
  }, [idle, rotation, svg])
  useEffect(() => {
    if (!spinning || !config.pointer_changes) return
    let frame: number
    const tick = () => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(svg.current!).transform)
      const angle = ((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI + 360) % 360
      pointer.current!.style.background = colors[indexAtPointer(angle, count)]
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [spinning, config.pointer_changes, count, colors, svg])
  return (
    <div className={`wheel-stage ${spinning ? 'is-spinning' : ''}`}>
      <span className="orbit-dot dot-one" />
      <span className="orbit-dot dot-two" />
      <div
        ref={pointer}
        className="wheel-pointer"
        aria-hidden="true"
        style={{ background: config.pointer_color }}
      />
      <div className="wheel-rim" style={{ boxShadow: config.shadow ? undefined : 'none' }}>
        <svg
          ref={svg}
          viewBox="0 0 400 400"
          role="img"
          aria-label={`${t.wheel}: ${t.count(count)}`}
          className="wheel-svg"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? `${config.duration}s` : '0ms',
          }}
        >
          <defs>
            <clipPath id="wheel-clip">
              <circle cx="200" cy="200" r="190" />
            </clipPath>
          </defs>
          <circle cx="200" cy="200" r="190" fill={count ? colors[0] : '#e8e4f0'} />
          {config.mode === 'image' && config.wheel_image && (
            <image
              href={config.wheel_image}
              x="10"
              y="10"
              width="380"
              height="380"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#wheel-clip)"
            />
          )}
          {options.map((option, i) => {
            const angle = ((i + 0.5) * 360) / count
            const label = Array.from(option.label)
            const visibleLabel =
              count > 48
                ? String(i + 1)
                : label.slice(0, count > 16 ? 12 : 17).join('') +
                  (label.length > (count > 16 ? 12 : 17) ? '…' : '')
            const showText =
              config.text !== 'never' && !(config.text === 'unless_image' && option.image)
            const selected = winnerId === option.id && !spinning && config.animate_winner
            const fill = colors[i]
            return (
              <g
                key={option.id}
                data-option-id={option.id}
                className={selected ? 'winning-sector' : ''}
              >
                {count > 1 && (
                  <path
                    d={sectorPath(i, count)}
                    fill={config.mode === 'colors' ? fill : 'transparent'}
                    stroke={config.borders ? '#343044' : 'none'}
                    strokeWidth={count > 50 ? 0.3 : 1}
                  />
                )}
                <g transform={`rotate(${angle} 200 200)`}>
                  {option.image && (
                    <image
                      href={option.image}
                      x={200 - Math.min(24, 400 / count) / 2}
                      y="30"
                      width={Math.min(24, 400 / count)}
                      height={Math.min(36, 600 / count)}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  )}
                  {showText && (
                    <text
                      x="200"
                      y="85"
                      textAnchor="middle"
                      fontSize={
                        count > 48
                          ? 2
                          : Math.min(
                              count > 16 ? 8 : count > 10 ? 12 : 24,
                              160 / visibleLabel.length,
                            )
                      }
                      fontWeight="650"
                      fill={config.mode === 'image' ? '#161322' : textColor(fill)}
                      stroke={config.mode === 'image' ? '#ffffff' : 'none'}
                      strokeWidth="3"
                      paintOrder="stroke"
                      transform="rotate(90 200 85)"
                    >
                      {visibleLabel}
                    </text>
                  )}
                </g>
                <title>{option.label}</title>
              </g>
            )
          })}
        </svg>
        <button
          className="wheel-spin-control"
          aria-label={t.spin}
          disabled={!canSpin}
          onClick={onSpin}
        >
          <span>{spinning ? t.spinning : t.spin}</span>
        </button>
      </div>
    </div>
  )
}
