import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { t } from '../i18n'

export function Dialog({
  title,
  close,
  children,
  headerClose = true,
}: {
  title: string
  close: () => void
  children: ReactNode
  headerClose?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement
    const dialog = ref.current!
    dialog.showModal()
    return () => {
      dialog.close()
      opener.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        {headerClose && (
          <button className="icon-button" onClick={close} aria-label={t.close}>
            <X size={20} />
          </button>
        )}
      </div>
      {children}
    </dialog>
  )
}
