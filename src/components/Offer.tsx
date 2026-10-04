import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Blogs, cut } from "./cards"
import { inr } from "../lib/utils"

export type OfferProfile = {
  id: string
  name: string
  params: string[]
}

export function OfferView({
  name,
  fasting,
  audience,
  tat,
  price,
  mrp,
  profiles,
  home,
  onAdd,
}: {
  name: string
  fasting: boolean
  audience: string
  tat: string
  price: number
  mrp: number
  profiles: OfferProfile[]
  home: boolean
  onAdd: () => void
}) {
  const [open, setOpen] = useState<string[]>([])
  const [added, setAdded] = useState(false)
  const [stuck, setStuck] = useState(false)
  const saved = cut(price, mrp)
  const parameters = profiles.reduce((sum, profile) => sum + profile.params.length, 0)

  useEffect(() => {
    const node = document.querySelector(".offer-price")
    if (!node) return
    const watch = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { rootMargin: "-120px 0px 0px 0px" })
    watch.observe(node)
    return () => watch.disconnect()
  }, [])

  function add() {
    onAdd()
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="offer">
      <p className="crumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        {name}
      </p>
      <section className="offer-hero">
        <div>
          <h1>{name}</h1>
          <div className="offer-facts">
            <Fact label="Fasting" value={fasting ? "Yes" : "No"} kind="clip" />
            <Fact label="Recommended for" value={audience} kind="person" />
            <Fact label="Report" value={tat} kind="clock" />
          </div>
        </div>
        <aside className="offer-price">
          <p>{name}</p>
          <strong>{inr(price)}</strong>
          <span className="offer-was">
            {mrp > price && <s>{inr(mrp)}</s>}
            {saved > 0 && <em>{saved}% off</em>}
          </span>
          <button type="button" onClick={add}>{added ? "Added" : "Add to cart"}</button>
        </aside>
      </section>

      {stuck && (
        <div className="offer-stick on">
          <div>
            <strong>{name}</strong>
            <span>
              {inr(price)}
              {mrp > price && <s>{inr(mrp)}</s>}
              {saved > 0 && <em>{saved}% off</em>}
            </span>
            <button type="button" onClick={add}>{added ? "Added" : "Add to cart"}</button>
          </div>
        </div>
      )}

      <div className="offer-main">
        <div>
          <div className="offer-count">
            <h2>{parameters === 1 ? "1 test parameter" : `${parameters} test parameters`}</h2>
            <span>
              {profiles.length === 1 ? "1 profile" : `${profiles.length} profiles`} | {parameters === 1 ? "1 parameter" : `${parameters} parameters`}
            </span>
          </div>
          <div className="offer-grid">
            {profiles.map((profile) => {
              const shown = open.includes(profile.id)
              const count = profile.params.length
              return (
                <article key={profile.id} className={`profile ${shown ? "open" : ""}`}>
                  <button
                    type="button"
                    aria-expanded={shown}
                    onClick={() => setOpen((current) => (shown ? current.filter((id) => id !== profile.id) : [...current, profile.id]))}
                  >
                    <i aria-hidden="true">{iconFor(profile.id)}</i>
                    <span>
                      {profile.name}
                      <em> ({count === 1 ? "1 parameter" : `${count} parameters`})</em>
                    </span>
                    <b className="chev" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </b>
                  </button>
                  {shown && (
                    <ul>
                      {profile.params.map((param) => (
                        <li key={param}>
                          {param}
                          <span>1 parameter</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )
            })}
          </div>
        </div>
        <aside className="offer-visit">
          <h2>Book a home visit</h2>
          <p>
            {home
              ? "Book this test and give the sample at home. Collection in Yanam starts at 7:00 AM."
              : "Part of this visit stays at Ferry Road. Blood samples can still be collected at home from 7:00 AM."}
          </p>
          <button type="button" onClick={() => window.dispatchEvent(new Event("lumen-help"))}>
            <PhoneIcon /> Get instant call back
          </button>
        </aside>
      </div>

      <section className="offer-why">
        <div>
          <h2>Why Aurora Diagnostics?</h2>
          <p className="lead">A new lab on Ferry Road, built for Yanam.</p>
          <p>
            Pathology, ultrasound, digital X-ray, and ECG share one building. Home collection covers the town from 7:00 AM, and a report leaves only after a doctor signs it.
          </p>
        </div>
        <div className="cred">
          <div className="cred-mark">
            NABL scope
            <span>Doctor-signed reports</span>
          </div>
          <div className="cred-stats">
            <Stat value="1" label="Lab on Ferry Road" />
            <Stat value="2" label="Yanam desks" />
            <Stat value="7 AM" label="Home collection" />
            <Stat value="Signed" label="By a doctor" />
          </div>
        </div>
      </section>

      <Blogs />

      <section className="offer-about">
        <h2>About us</h2>
        <p>
          Aurora Diagnostics opened in 2026 at D. No. 8-2-14, Ferry Road, Yanam. Blood tests, ultrasound, X-ray, and ECG are booked, drawn, and reported from this centre. Home collection covers Yanam town, Mettakuru, Dariyalatippa, and Farampeta.
        </p>
      </section>
    </div>
  )
}

function Fact({ label, value, kind }: { label: string; value: string; kind: "clip" | "person" | "clock" }) {
  return (
    <article>
      <i aria-hidden="true">{kind === "clip" ? <ClipIcon /> : kind === "person" ? <PersonIcon /> : <ClockIcon />}</i>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <article>
      <i aria-hidden="true">{value}</i>
      <span>{label}</span>
    </article>
  )
}

function iconFor(id: string) {
  if (id === "lft") return <OrganIcon />
  if (id === "kft" || id === "creatinine" || id === "urea") return <DropIcon />
  if (id === "lipid" || id === "ecg" || id === "echo" || id === "tmt" || id === "crp") return <HeartIcon />
  if (id === "thyroid" || id === "tsh") return <ThyroidIcon />
  if (id === "hba1c") return <DropIcon />
  if (id === "urine") return <FlaskIcon />
  if (id === "usg-abd" || id === "xray" || id === "mri-brain" || id === "ct-chest" || id === "mammo") return <ScanIcon />
  return <FlaskIcon />
}

function ClipIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="6" y="4" width="12" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4.5h6v2H9zM8 11h8M8 15h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6 19c1.4-3 3.4-4.5 6-4.5S16.6 16 18 19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8.5V12l2.5 2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4h2l1 4-2 1a12 12 0 006 6l1-2 4 1v2a2 2 0 01-2 2A14 14 0 016 6a2 2 0 012-2z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M9 3h6M10 3v6L6 19a2 2 0 002 2h8a2 2 0 002-2l-4-10V3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 19s-6-3.6-6-8a3.5 3.5 0 016-2 3.5 3.5 0 016 2c0 4.4-6 8-6 8z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function DropIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function OrganIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M8 7c2-3 6-2 7 1 2 0 4 2 4 5s-2 6-5 6c-2 2-5 2-7 0-2-1-3-3-2-6 0-3 1-5 3-6z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function ThyroidIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 4v4M8 10c0 5 1.5 9 4 9s4-4 4-9c-2 1-6 1-8 0z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 15c1.2-3 2.4-4.5 4-4.5S14.8 12 16 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
