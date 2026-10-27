import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { languages, setLanguage, translate, type Language } from '../locale'
import { Dialog } from './Dialog'

export function LanguageMenu({ language, disabled }: { language: Language; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const selected = languages.find(({ code }) => code === language)!
  return (
    <div className="language-picker">
      <button
        className="language-trigger"
        aria-label={translate('Language')}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <img src={`/flags/${selected.country}.svg`} alt="" width={24} height={18} />
        <span lang={selected.code}>{selected.name}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <Dialog title={translate('Language')} close={() => setOpen(false)}>
          <div className="language-grid">
            {languages.map(({ code, name, country }) => (
              <button
                key={code}
                aria-pressed={code === language}
                onClick={() => {
                  setLanguage(code)
                  setOpen(false)
                }}
              >
                <img src={`/flags/${country}.svg`} alt="" width={32} height={24} />
                <span lang={code}>{name}</span>
                {code === language && <Check size={16} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </Dialog>
      )}
    </div>
  )
}
