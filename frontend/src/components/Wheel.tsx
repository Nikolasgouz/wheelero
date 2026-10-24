import { useEffect, useRef } from 'react'
import { indexAtPointer, sectorPath } from '../lib/geometry'
import { textColor } from '../lib/presentation'
import type { Customization } from '../customization'
import { t } from '../i18n'
import type { Option } from '../types'

const sizes = { XS: 10, S: 16, M: 24, L: 32, XL: 42, XXL: 54 }
export function Wheel({
  options,
  rotation,
  spinning,
  config,
  winnerId,
}: {
  options: Option[]
  rotation: number
  spinning: boolean
  config: Customization
  winnerId: string | null
}) {
  const svg = useRef<SVGSVGElement>(null)
  const pointer = useRef<HTMLDivElement>(null)
  const count = options.length
  const colors = config.palette.filter((color) => color.enabled).map((color) => color.color)
  const paletteKey = colors.join(',')
  useEffect(() => {
    if (!spinning || !config.pointer_changes) return
    const palette = paletteKey.split(',')
    let frame: number
    const tick = () => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(svg.current!).transform)
      const angle = ((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI + 360) % 360
      pointer.current!.style.background = palette[indexAtPointer(angle, count) % palette.length]
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [spinning, config.pointer_changes, count, paletteKey])
  return (
    <div className={`wheel-stage ${spinning ? 'is-spinning' : ''}`}>
      <span className="orbit-dot dot-one" />
      <span className="orbit-dot dot-two" />
      <span className="little-star star-one" aria-hidden="true">
        ✧
      </span>
      <span className="little-star star-two" aria-hidden="true">
        ✦
      </span>
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
            const showText =
              config.text !== 'never' && !(config.text === 'unless_image' && option.image)
            const selected = winnerId === option.id && !spinning && config.animate_winner
            const fill = colors[i % colors.length]
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
                      fontSize={count > 48 ? 2 : count > 16 ? 6 : count > 10 ? 10 : 14}
                      fontWeight="650"
                      fill={config.mode === 'image' ? '#161322' : textColor(fill)}
                      stroke={config.mode === 'image' ? '#ffffff' : 'none'}
                      strokeWidth="3"
                      paintOrder="stroke"
                      transform="rotate(90 200 85)"
                    >
                      {count > 48 ? i + 1 : label.slice(0, count > 16 ? 12 : 17).join('')}
                      {count <= 48 && label.length > (count > 16 ? 12 : 17) ? '…' : ''}
                    </text>
                  )}
                </g>
                <title>{option.label}</title>
              </g>
            )
          })}
        </svg>
        {config.mode === 'colors' && config.center_image ? (
          <img
            className="wheel-center-image"
            src={config.center_image}
            alt=""
            style={{
              width: `${sizes[config.center_size]}%`,
              height: `${sizes[config.center_size]}%`,
            }}
          />
        ) : (
          <div className="wheel-hub" aria-hidden="true">
            <span>γ.</span>
          </div>
        )}
      </div>
    </div>
  )
}
