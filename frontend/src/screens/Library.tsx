import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { t } from '../i18n'
import type { LocalWheel } from '../types'
import { addWheels, deleteWheel, forkWheel, selectWheel } from '../state/store'
import { makeWheel } from '../state/wheel'
import { templates } from '../state/templates'

export function Library({
  wheels,
  active,
  run,
  openEditor,
  openWheel,
}: {
  wheels: LocalWheel[]
  active: string
  run: (task: () => Promise<unknown>) => void
  openEditor: () => void
  openWheel: () => void
}) {
  return (
    <section className="library-screen">
      <div className="section-heading">
        <div>
          <h2>{t.library}</h2>
          <p>{t.savedWheelsHint}</p>
        </div>
        <button
          className="primary"
          onClick={() =>
            run(async () => {
              await addWheels([makeWheel(templates[0].title, templates[0].options)])
              openWheel()
            })
          }
        >
          <Plus size={18} />
          {t.newWheel}
        </button>
      </div>
      {!wheels.length && <p className="card empty-library">{t.noSavedWheels}</p>}
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
                  openWheel()
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
    </section>
  )
}
