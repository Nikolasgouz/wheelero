import { useState } from 'react'
import { getLanguage, translate } from '../locale'
import { generateNumbers } from '../lib/numbers'

export function NumberGenerator() {
  const [minimum, setMinimum] = useState('1')
  const [maximum, setMaximum] = useState('100')
  const [quantity, setQuantity] = useState('1')
  const [repeats, setRepeats] = useState(false)
  const [results, setResults] = useState<number[]>([])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [batch, setBatch] = useState(0)
  return (
    <section className="number-generator card" lang={getLanguage()}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          try {
            const next = generateNumbers(
              minimum === '' ? NaN : Number(minimum),
              maximum === '' ? NaN : Number(maximum),
              quantity === '' ? NaN : Number(quantity),
              repeats,
            )
            setResults(next)
            setBatch(batch + 1)
            setStatus(
              `${translate('Results')} (${batch + 1}): ${next.length === 1 ? next[0] : `${translate('Generated numbers')}: ${next.length}`}`,
            )
            setError('')
          } catch (error) {
            if (!(error instanceof RangeError)) throw error
            setError(translate(error.message))
          }
        }}
      >
        <div className="number-fields">
          <label>
            {translate('Minimum')}
            <input
              type="number"
              step="1"
              min="-1000000000"
              max="1000000000"
              required
              value={minimum}
              onChange={(e) => setMinimum(e.target.value)}
            />
          </label>
          <label>
            {translate('Maximum')}
            <input
              type="number"
              step="1"
              min="-1000000000"
              max="1000000000"
              required
              value={maximum}
              onChange={(e) => setMaximum(e.target.value)}
            />
          </label>
          <label>
            {translate('Quantity')}
            <input
              type="number"
              step="1"
              min="1"
              max="1000"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
        </div>
        <label className="number-repeat">
          <input type="checkbox" checked={repeats} onChange={(e) => setRepeats(e.target.checked)} />
          {translate('Allow repeats')}
        </label>
        <p className="muted">
          {translate('Both limits are included. Without repeats applies to each generated batch.')}
        </p>
        <button className="primary">{translate('Generate numbers')}</button>
        {error && <p role="alert">{error}</p>}
      </form>
      <p role="status" aria-live="polite">
        {status}
      </p>
      {results.length > 0 && (
        <section>
          <h2>{translate('Results')}</h2>
          <label className="sr-only" htmlFor="generated-numbers">
            {translate('Generated numbers')}
          </label>
          <textarea
            id="generated-numbers"
            className="number-results"
            readOnly
            rows={5}
            value={results.join('\n')}
          />
          <button
            className="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(results.join('\n'))
                setStatus(translate('Copied'))
              } catch (error) {
                if (!(error instanceof DOMException)) throw error
                setStatus(translate('Select the results and copy them manually.'))
              }
            }}
          >
            {translate('Copy results')}
          </button>
        </section>
      )}
    </section>
  )
}
