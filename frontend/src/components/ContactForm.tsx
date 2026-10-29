import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { translate } from '../locale'

export function ContactForm({ formId }: { formId: string }) {
  const sending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  return (
    <form
      className="contact-form"
      aria-busy={busy}
      onSubmit={async (event) => {
        event.preventDefault()
        if (sending.current || !formId) return
        const form = event.currentTarget
        const data = new FormData(form)
        setStatus('')
        setError('')
        if ((data.get('message') as string).trim().length < 10) {
          setError('Please enter at least 10 characters of message text.')
          return
        }
        sending.current = true
        setBusy(true)
        try {
          const response = await fetch(
            `https://formspree.io/f/${encodeURIComponent(formId)}`,
            {
              method: 'POST',
              body: data,
              headers: { Accept: 'application/json' },
              credentials: 'omit',
              referrerPolicy: 'origin',
              signal: AbortSignal.timeout(20000),
            },
          )
          if (!response.ok) {
            setError(
              response.status === 429
                ? 'Too many requests. Please wait before trying again.'
                : 'Your message was not accepted. Your text is still here. Please try again later.',
            )
            return
          }
          form.reset()
          setStatus('Message submitted. Thank you for getting in touch.')
        } catch {
          setError(
            'We could not confirm submission. Your text is still here. Check your connection before trying again.',
          )
        } finally {
          sending.current = false
          setBusy(false)
        }
      }}
    >
      <h2>{translate('Send a message')}</h2>
      {!formId && (
        <p className="contact-feedback" role="status">
          {translate('Message sending is not available yet. Please check back later.')}
        </p>
      )}
      <fieldset disabled={busy}>
        <label htmlFor="contact-reply-email">{translate('Your email')}</label>
        <input
          id="contact-reply-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
        <label htmlFor="contact-message">{translate('Your message')}</label>
        <textarea
          id="contact-message"
          name="message"
          rows={7}
          required
          minLength={10}
          maxLength={5000}
          aria-describedby="contact-message-limit"
        />
        <p id="contact-message-limit" className="contact-hint">
          {translate('10–5,000 characters. Please do not include sensitive information.')}
        </p>
        <input
          type="text"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          className="contact-trap"
          aria-hidden="true"
        />
        <p className="contact-hint">
          {translate(
            'Sending uses Formspree to deliver your email address and message to our support inbox.',
          )}{' '}
          <a href="/privacy">{translate('Privacy Policy')}</a>
        </p>
        <button className="primary" type="submit" disabled={!formId || busy}>
          <Send size={17} aria-hidden="true" />
          {translate(busy ? 'Sending message…' : 'Send message')}
        </button>
      </fieldset>
      <p role="alert" className="contact-feedback contact-error">
        {translate(error)}
      </p>
      <p role="status" className="contact-feedback">
        {translate(status)}
      </p>
    </form>
  )
}
