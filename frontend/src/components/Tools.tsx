import { useState } from 'react'
import { parseEntries } from '../lib/entries'
import { generateTeams } from '../lib/teams'

export function NumberRange({
  disabled,
  apply,
}: {
  disabled: boolean
  apply: (labels: string[]) => void
}) {
  const [minimum, setMinimum] = useState('1')
  const [maximum, setMaximum] = useState('10')
  const [error, setError] = useState('')
  return (
    <form
      className="number-range"
      onSubmit={(event) => {
        event.preventDefault()
        const min = Number(minimum),
          max = Number(maximum)
        if (
          !minimum ||
          !maximum ||
          !Number.isSafeInteger(min) ||
          !Number.isSafeInteger(max) ||
          max < min ||
          max - min >= 10000
        ) {
          setError('Use whole numbers and a range of 1–10,000 entries.')
          return
        }
        apply(Array.from({ length: max - min + 1 }, (_, index) => String(min + index)))
        setError('')
      }}
    >
      <label>
        Minimum
        <input
          type="number"
          step="1"
          value={minimum}
          disabled={disabled}
          onChange={(e) => setMinimum(e.target.value)}
        />
      </label>
      <label>
        Maximum
        <input
          type="number"
          step="1"
          value={maximum}
          disabled={disabled}
          onChange={(e) => setMaximum(e.target.value)}
        />
      </label>
      <button className="secondary" disabled={disabled}>
        Generate number wheel
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}

export function TeamGenerator() {
  const [text, setText] = useState(localStorage.getItem('wheelero-team-draft') ?? '')
  const [count, setCount] = useState('2')
  const [teams, setTeams] = useState<string[][]>([])
  const [error, setError] = useState('')
  return (
    <section className="team-tool card" lang="en">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const names = parseEntries(text)
          if (names.some((name) => name.length > 160)) {
            setError('Names may contain up to 160 characters.')
            return
          }
          try {
            setTeams(generateTeams(names, Number(count)))
            setError('')
          } catch (error) {
            if (!(error instanceof RangeError)) throw error
            setError(error.message)
          }
        }}
      >
        <label htmlFor="team-names">Names — one per line or spreadsheet cell</label>
        <textarea
          id="team-names"
          rows={8}
          maxLength={1610000}
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            localStorage.setItem('wheelero-team-draft', event.target.value)
          }}
        />
        <label htmlFor="team-count">Number of teams</label>
        <input
          id="team-count"
          type="number"
          min="2"
          max="10000"
          step="1"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
        <button className="primary">Generate teams</button>
        {error && <p role="alert">{error}</p>}
      </form>
      <div aria-live="polite" className="team-results">
        {teams.map((team, index) => (
          <section key={index}>
            <h2>Team {index + 1}</h2>
            <ul>
              {team.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {teams.length > 0 && (
        <button
          className="secondary"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob(
                [
                  '\uFEFF' +
                    teams
                      .map((team, index) => `Team ${index + 1}\r\n${team.join('\r\n')}`)
                      .join('\r\n\r\n'),
                ],
                { type: 'text/plain;charset=utf-8' },
              ),
            )
            const link = document.createElement('a')
            link.href = url
            link.download = 'wheelero-teams.txt'
            link.click()
            URL.revokeObjectURL(url)
          }}
        >
          Export teams
        </button>
      )}
    </section>
  )
}
