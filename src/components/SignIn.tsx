import { useEffect, useId, useRef, useState } from "react"
import type { FormEvent, KeyboardEvent as Key } from "react"
import { Link, useNavigate } from "react-router-dom"
import { demoOtp, useStore } from "../context/Store"
import { digits } from "../lib/utils"

export function SignIn({ open, onClose, onSignedIn }: { open: boolean; onClose: () => void; onSignedIn: () => void }) {
  const titleId = useId()
  const navigate = useNavigate()
  const { signInWithOtp, signInStaff } = useStore()
  const [step, setStep] = useState<"phone" | "otp" | "staff">("phone")
  const [mobile, setMobile] = useState("")
  const [agree, setAgree] = useState(true)
  const [boxes, setBoxes] = useState(["", "", "", ""])
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState("")
  const [staffId, setStaffId] = useState("")
  const [staffPassword, setStaffPassword] = useState("")
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || seconds <= 0) return
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [open, seconds])

  if (!open) return null

  function send(event: FormEvent) {
    event.preventDefault()
    if (digits(mobile).length !== 10) return setError("Use a 10-digit mobile number.")
    if (!agree) return setError("Agree before we send a code.")
    setError("")
    setBoxes(["", "", "", ""])
    setSeconds(38)
    setStep("otp")
  }

  function confirm(event: FormEvent) {
    event.preventDefault()
    const message = signInWithOtp(mobile, boxes.join(""))
    if (message) return setError(message)
    setError("")
    onSignedIn()
  }

  function staff(event: FormEvent) {
    event.preventDefault()
    const message = signInStaff(staffId, staffPassword)
    if (message) return setError(message)
    setError("")
    onClose()
    navigate("/console")
  }

  function typeBox(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...boxes]
    next[index] = digit
    setBoxes(next)
    if (digit && inputs.current[index + 1]) inputs.current[index + 1]?.focus()
  }

  function keyBox(index: number, event: Key<HTMLInputElement>) {
    if (event.key === "Backspace" && !boxes[index] && inputs.current[index - 1]) inputs.current[index - 1]?.focus()
  }

  return (
    <div className="help-back" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="help signin" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <aside className="help-side signin-art" aria-hidden="true">
          <svg viewBox="0 0 280 420">
            <circle cx="40" cy="80" r="120" fill="#14555e" />
            <circle cx="210" cy="300" r="90" fill="#1a6a62" />
            <rect x="78" y="168" width="124" height="150" rx="16" fill="#f4faf8" />
            <rect x="98" y="188" width="84" height="58" rx="8" fill="#e7f2f0" />
            <text x="112" y="214" fill="#0e3c43" fontSize="11" fontWeight="700">OTP</text>
            <rect x="108" y="224" width="14" height="10" rx="2" fill="#0e3c43" />
            <rect x="128" y="224" width="14" height="10" rx="2" fill="#0e3c43" />
            <rect x="148" y="224" width="14" height="10" rx="2" fill="#c4a265" />
            <circle cx="92" cy="360" r="28" fill="#c4a265" />
            <circle cx="188" cy="352" r="22" fill="#f4faf8" />
            <path d="M70 250h140" stroke="#0e3c43" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </aside>
        <form className="help-form" onSubmit={step === "phone" ? send : step === "otp" ? confirm : staff}>
          <button type="button" className="help-x" onClick={onClose} aria-label="Close">×</button>
          {step === "staff" ? (
            <>
              <h2 id={titleId}>Lab desk</h2>
              <p>Staff id meera, password aurora.</p>
              <label>
                Staff id
                <input value={staffId} onChange={(event) => setStaffId(event.target.value)} placeholder="meera" autoComplete="username" />
              </label>
              <label>
                Password
                <input type="password" value={staffPassword} onChange={(event) => setStaffPassword(event.target.value)} placeholder="aurora" autoComplete="current-password" />
              </label>
              {error && <p className="err">{error}</p>}
              <button type="submit" className="solid help-submit">Open the desk</button>
              <button type="button" className="text-link" onClick={() => { setStep("phone"); setError("") }}>Patient sign in</button>
            </>
          ) : step === "phone" ? (
            <>
              <h2 id={titleId}>Sign in</h2>
              <p className="signin-lead">View your reports and upcoming checkups in one place.</p>
              <label>
                Mobile no. <span className="hint">(a code is sent to this number)</span>
                <input value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Enter here" inputMode="numeric" autoComplete="tel" />
              </label>
              <p className="hint">Demo code {demoOtp} for 9848012345.</p>
              <label className="check">
                <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} />
                <span>By proceeding, you agree the desk may use this number for the code and your reports.</span>
              </label>
              {error && <p className="err">{error}</p>}
              <button type="submit" className="solid help-submit">Send OTP</button>
              <p className="hint">
                New here? <Link to="/register" onClick={onClose}>Create an account</Link>
                <span> · </span>
                <button type="button" className="text-link" onClick={() => { setStep("staff"); setError("") }}>Lab desk</button>
              </p>
            </>
          ) : (
            <>
              <h2 id={titleId}>OTP verification</h2>
              <p className="signin-lead">Enter the code for the mobile number you just gave.</p>
              <p>
                OTP * <span className="hint">(sent to {digits(mobile)})</span>{" "}
                <button type="button" className="text-link" onClick={() => { setStep("phone"); setError("") }}>change</button>
              </p>
              <div className="otp">
                {boxes.map((box, index) => (
                  <input
                    key={index}
                    ref={(node) => { inputs.current[index] = node }}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${index + 1}`}
                    value={box}
                    onChange={(event) => typeBox(index, event.target.value)}
                    onKeyDown={(event) => keyBox(index, event)}
                  />
                ))}
              </div>
              <p className="hint center">
                {seconds > 0 ? `Resend OTP in ${seconds}s` : (
                  <button type="button" className="text-link" onClick={() => { setSeconds(38); setBoxes(["", "", "", ""]); setError("") }}>Resend OTP</button>
                )}
              </p>
              <p className="hint center">Demo code {demoOtp}</p>
              {error && <p className="err">{error}</p>}
              <button type="submit" className="solid help-submit">Confirm</button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
