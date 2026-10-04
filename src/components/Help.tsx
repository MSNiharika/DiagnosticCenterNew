import { useEffect, useId, useState } from "react"
import type { FormEvent } from "react"
import { centrePhone, centrePhoneTel } from "../data/network"
import { digits } from "../lib/utils"

export function HelpPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId()
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [consent, setConsent] = useState(true)
  const [whatsapp, setWhatsapp] = useState(true)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null

  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2) return setError("Enter your name.")
    if (digits(mobile).length !== 10) return setError("Use a 10-digit mobile number.")
    if (!consent) return setError("Agree to a call before sending.")
    setError("")
    setSent(true)
  }

  return (
    <div className="help-back" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="help" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <aside className="help-side">
          <ul>
            <li>
              <span>Home sample collection from</span>
              <em>7:00 AM</em>
            </li>
            <li>
              <span>A report after</span>
              <em>a doctor signs</em>
            </li>
          </ul>
          <div className="help-mark" aria-hidden="true">
            <svg viewBox="0 0 220 220">
              <defs>
                <path id="ring" d="M110,110 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" />
              </defs>
              <circle cx="110" cy="110" r="104" fill="#14555e" />
              <circle cx="110" cy="110" r="86" fill="none" stroke="#c4a265" strokeWidth="16" />
              <circle cx="110" cy="110" r="64" fill="#1a6a62" />
              <text fill="#f7f3ea" fontSize="11" letterSpacing="2.4">
                <textPath href="#ring">FERRY ROAD · YANAM · FERRY ROAD · YANAM · </textPath>
              </text>
              <g transform="translate(78 72) scale(2.6)" fill="none" stroke="#f4faf8" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
                <path d="M7 10v12" />
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
              </g>
            </svg>
          </div>
        </aside>
        <form className="help-form" onSubmit={submit}>
          <button type="button" className="help-x" onClick={onClose} aria-label="Close">
            ×
          </button>
          <h2 id={titleId}>Need help booking a test?</h2>
          {sent ? (
            <p className="lead">
              Noted for {name.trim()}. This demo keeps the request on this page. Call{" "}
              <a href={`tel:${centrePhoneTel}`}>{centrePhone}</a>
              {whatsapp ? ", or wait for a message on this number." : "."}
            </p>
          ) : (
            <>
              <p>
                Share your details and the desk will call you. Or call{" "}
                <a href={`tel:${centrePhoneTel}`}>{centrePhone}</a>.
              </p>
              <label>
                Name *
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter name" autoComplete="name" />
              </label>
              <label>
                Mobile no *
                <input value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Mobile number" inputMode="numeric" autoComplete="tel" />
              </label>
              <label className="check">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>The desk may call this number about the booking</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={whatsapp} onChange={(event) => setWhatsapp(event.target.checked)} />
                <span>Send updates on this number</span>
              </label>
              {error && <p className="err">{error}</p>}
              <button type="submit" className="solid help-submit">Submit</button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
