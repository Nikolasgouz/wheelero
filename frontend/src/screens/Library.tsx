import { Copy, Download, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { t } from '../i18n'
import { backupSchema, type LocalWheel } from '../types'
import { addWheels, deleteWheel, forkWheel, makeWheel, selectWheel } from '../state/store'

export function Library({
  wheels,
  active,
  run,
  openEditor,
}: {
  wheels: LocalWheel[]
  active: string
  run: (task: () => Promise<unknown>) => void
  openEditor: () => void
}) {
  const file = useRef<HTMLInputElement>(null)
  return (
    <section className="library-screen">
      <div className="section-heading">
        <div>
          <h1>{t.library}</h1>
          <p>{t.autoSave}</p>
        </div>
        <button
          className="primary"
          onClick={() =>
            run(async () => {
              await addWheels([makeWheel(t.newTitle, [])])
              openEditor()
            })
          }
        >
          <Plus size={18} />
          {t.newWheel}
        </button>
      </div>
      <div className="library-grid">
        {wheels.map((wheel) => (
          <article
            key={wheel.id}
            className={`card wheel-card ${wheel.id === active ? 'active' : ''}`}
          >
            <button
              className="wheel-card-open"
              onClick={() =>
                run(async () => {
                  await selectWheel(wheel.id)
                  openEditor()
                })
              }
            >
              <span className="mini-wheel" />
              <h2>{wheel.title}</h2>
              <p>
                {t.count(wheel.options.length)} · {t.historyCount(wheel.results.length)}
              </p>
            </button>
            <div className="wheel-card-actions">
              <button
                aria-label={`${t.rename}: ${wheel.title}`}
                onClick={() =>
                  run(async () => {
                    await selectWheel(wheel.id)
                    openEditor()
                  })
                }
              >
                <Pencil size={16} />
              </button>
              <button
                aria-label={`${t.copy}: ${wheel.title}`}
                onClick={() =>
                  run(() =>
                    addWheels([
                      forkWheel({
                        ...wheel,
                        title: `${Array.from(wheel.title).slice(0, 100).join('')} · ${t.copy}`,
                      }),
                    ]),
                  )
                }
              >
                <Copy size={16} />
              </button>
              <button
                aria-label={`${t.delete}: ${wheel.title}`}
                onClick={() => {
                  if (confirm(t.deleteConfirm)) run(() => deleteWheel(wheel.id))
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="backup-actions">
        <button
          className="secondary"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob(
                [
                  JSON.stringify(
                    {
                      format: 'gyrna',
                      version: 1,
                      wheels: wheels.map(
                        ({ title, no_repeat, customization, options, results }) => ({
                          title,
                          no_repeat,
                          customization,
                          options,
                          results,
                        }),
                      ),
                    },
                    null,
                    2,
                  ),
                ],
                { type: 'application/json' },
              ),
            )
            const a = document.createElement('a')
            a.href = url
            a.download = `gyrna-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          <Download size={17} />
          {t.export}
        </button>
        <button className="secondary" onClick={() => file.current!.click()}>
          <Upload size={17} />
          {t.import}
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const selected = e.target.files?.[0]
            if (!selected) return
            e.target.value = ''
            run(async () => {
              if (selected.size > 100_000_000) throw new Error(t.fileTooLarge)
              let json: unknown
              try {
                json = JSON.parse(await selected.text())
              } catch (error) {
                if (error instanceof SyntaxError) throw new Error(t.importInvalid)
                throw error
              }
              const data = backupSchema.safeParse(json)
              if (!data.success) throw new Error(t.importInvalid)
              await addWheels(data.data.wheels.map(forkWheel))
            })
          }}
        />
      </div>
    </section>
  )
}
