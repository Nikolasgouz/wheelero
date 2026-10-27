import { GraduationCap } from 'lucide-react'
import { toolLinks, type SitePath } from '../site'
import { translate } from '../locale'

export function ToolNavigation({
  path,
  classroom,
  disabled,
}: {
  path: SitePath
  classroom: () => void
  disabled: boolean
}) {
  return (
    <nav className="tool-navigation" aria-label={translate('Tools')}>
      {toolLinks.map(([href, label]) => (
        <a
          key={href}
          href={href}
          aria-current={path === href ? 'page' : undefined}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(event) => {
            if (disabled) event.preventDefault()
          }}
        >
          {translate(label)}
        </a>
      ))}
      <button className="classroom-entry" disabled={disabled} onClick={classroom}>
        <GraduationCap size={17} />
        {translate('Classroom')}
      </button>
    </nav>
  )
}
