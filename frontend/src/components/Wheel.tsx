import { colors, sectorPath } from '../lib/geometry'
import { t } from '../i18n'
import type { Option } from '../types'

export function Wheel({
  options,
  rotation,
  spinning,
}: {
  options: Option[]
  rotation: number
  spinning: boolean
}) {
  const count = options.length
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
      <div className="wheel-pointer" aria-hidden="true" />
      <div className="wheel-rim">
        <svg
          viewBox="0 0 400 400"
          role="img"
          aria-label={`${t.wheel}: ${t.count(count)}`}
          className="wheel-svg"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? undefined : '0ms',
          }}
        >
          <circle cx="200" cy="200" r="190" fill={count ? colors[0] : '#e8e4f0'} />
          {options.map((option, i) => {
            const angle = ((i + 0.5) * 360) / count
            const label = Array.from(option.label)
            return (
              <g key={option.id}>
                {count > 1 && (
                  <path
                    d={sectorPath(i, count)}
                    fill={colors[i % colors.length]}
                    stroke="#ffffffaa"
                    strokeWidth={count > 50 ? 0.4 : 1.5}
                  />
                )}
                {count <= 16 && (
                  <g transform={`rotate(${angle} 200 200)`}>
                    <text
                      x="200"
                      y={count > 8 ? '68' : '80'}
                      textAnchor="middle"
                      fill="#393246"
                      fontSize={count > 10 ? 10 : 14}
                      fontWeight="650"
                      transform={`rotate(90 200 ${count > 8 ? 68 : 80})`}
                    >
                      {label.slice(0, count > 8 ? 12 : 17).join('')}
                      {label.length > (count > 8 ? 12 : 17) ? '…' : ''}
                    </text>
                  </g>
                )}
                <title>{option.label}</title>
              </g>
            )
          })}
        </svg>
        <div className="wheel-hub" aria-hidden="true">
          <span>γ.</span>
        </div>
      </div>
      {count > 16 && <span className="large-list-label">{t.count(count)}</span>}
    </div>
  )
}
