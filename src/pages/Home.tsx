import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTitle } from "../components/ui"
import { PackageCard, TestCard } from "../components/cards"
import { packages, tests } from "../data/catalog"
import type { Package } from "../data/types"
import { centres, centrePhone } from "../data/network"

const filters: { id: string; label: string; match: (item: Package) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "women", label: "Women", match: (item) => item.id === "women" },
  { id: "heart", label: "Heart", match: (item) => item.id === "heart" },
  { id: "senior", label: "60+", match: (item) => item.id === "senior" },
  { id: "fever", label: "Fever", match: (item) => item.id === "fever" },
]

export function Home() {
  useTitle("Home")
  const navigate = useNavigate()
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState("all")
  const popular = tests.filter((test) => test.popular).slice(0, 4)
  const shown = useMemo(() => packages.filter(filters.find((item) => item.id === filter)?.match ?? (() => true)), [filter])

  function search(event: FormEvent) {
    event.preventDefault()
    window.dispatchEvent(new CustomEvent("lumen-search", { detail: q.trim() }))
  }

  return (
    <main>
      <section className="banner">
        <div>
          <h1>The full picture, from one morning.</h1>
          <p className="lead">Blood tests, ultrasound, X-ray, and ECG at Ferry Road, Yanam. Home collection from 7:00 AM.</p>
          <div className="marks">
            <span><i>CBC</i>Blood</span>
            <span><i>USG</i>Scan</span>
            <span><i>ECG</i>Heart</span>
            <span><i>XR</i>X-ray</span>
          </div>
        </div>
        <div className="seal">
          <div>
            <strong>Doctor-signed reports</strong>
            <small>Yanam · 2026</small>
          </div>
        </div>
      </section>

      <form className="dock" onSubmit={search}>
        <select aria-label="Centre" defaultValue="yanam" onChange={(event) => navigate(`/centres/${event.target.value}`)}>
          {centres.map((centre) => (
            <option key={centre.id} value={centre.id}>
              {centre.name}
            </option>
          ))}
        </select>
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder='Search for "Thyroid", "Full body" or "Vitamin D"...' aria-label="Search tests" />
        <button type="submit" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16.5L20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      <section className="doors">
        <Link className="door" to="/tests">
          <i>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 4h8v4H8zM7 8h10v12H7z" stroke="currentColor" strokeWidth="1.6" /></svg>
          </i>
          <span><strong>Book a test</strong><span>Search the full menu</span></span>
        </Link>
        <Link className="door" to="/prescription">
          <i>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 4h8l3 3v13H7z" stroke="currentColor" strokeWidth="1.6" /><path d="M15 4v4h4" stroke="currentColor" strokeWidth="1.6" /></svg>
          </i>
          <span><strong>Upload prescription</strong><span>We list the tests on it</span></span>
        </Link>
        <Link className="door" to="/reports">
          <i>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="1.6" /><path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </i>
          <span><strong>Download reports</strong><span>After a doctor signs</span></span>
        </Link>
        <Link className="door" to="/centres">
          <i>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.6" /></svg>
          </i>
          <span><strong>Find a centre</strong><span>Yanam and Mettakuru</span></span>
        </Link>
      </section>

      <section className="band">
        <div className="band-head">
          <div>
            <h2>Full body checkups</h2>
            <p className="sub">One price for the tests a physician usually orders together.</p>
          </div>
          <div className="filters" role="tablist">
            {filters.map((item) => (
              <button key={item.id} type="button" className={filter === item.id ? "on" : ""} onClick={() => setFilter(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pack-grid">
          {shown.map((item) => (
            <PackageCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="band">
        <div className="band-head">
          <div>
            <h2>Often booked on their own</h2>
            <p className="sub">Add a single test if you already know the name.</p>
          </div>
          <Link to="/tests">All tests</Link>
        </div>
        <div className="test-grid">
          {popular.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      </section>

      <div className="callbar">
        To book a home visit, call {centrePhone}
        <button type="button" className="gold" onClick={() => window.dispatchEvent(new Event("lumen-help"))}>Request a call</button>
      </div>
    </main>
  )
}

