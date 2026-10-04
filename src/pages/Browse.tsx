import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { packageById, packages, testById, tests } from "../data/catalog"
import { concernById } from "../data/concerns"
import { testLines } from "../data/voice"
import { useStore } from "../context/Store"
import { relevanceScore } from "../lib/utils"
import { MenuTest, PackageCard, TestCard } from "../components/cards"
import { OfferView } from "../components/Offer"
import { ButtonLink, Page, useTitle } from "../components/ui"

const menuCategories: { id: string; label: string; testIds?: string[] }[] = [
  { id: "all", label: "All" },
  { id: "diabetes", label: "Diabetes" },
  { id: "anemia", label: "Anemia" },
  { id: "heart", label: "Heart" },
  { id: "fever", label: "Fever" },
  { id: "vitamins", label: "Vitamins" },
  { id: "thyroid", label: "Thyroid" },
  { id: "hormones", label: "Hormones", testIds: ["thyroid", "tsh", "bhcg", "vitd"] },
  { id: "kidney", label: "Kidney" },
]

export function Tests({ preset }: { preset?: "scan" }) {
  if (preset === "scan") return <ScanTests />
  return <BloodTests />
}

function BloodTests() {
  useTitle("Blood tests")
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get("q") ?? "")
  const [concern, setConcern] = useState("all")
  const rail = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState({ prev: false, next: true })
  const active = menuCategories.find((item) => item.id === concern) ?? menuCategories[0]

  useEffect(() => {
    const row = rail.current
    if (!row) return
    const update = () => {
      const max = row.scrollWidth - row.clientWidth
      setCanScroll({ prev: row.scrollLeft > 4, next: row.scrollLeft < max - 4 })
    }
    update()
    row.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      row.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  function moveRail(direction: number) {
    const row = rail.current
    if (!row) return
    const cards = row.querySelectorAll<HTMLElement>(".cat")
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : row.clientWidth
    const max = row.scrollWidth - row.clientWidth
    const next = Math.min(max, Math.max(0, row.scrollLeft + direction * step))
    row.scrollTo({ left: next, behavior: "smooth" })
  }

  const rows = useMemo(() => {
    const ids = active.testIds ?? (active.id === "all" ? null : concernById(active.id)?.testIds ?? [])
    const allowed = ids ? new Set(ids) : null
    return tests
      .filter((test) => {
        if (allowed && !allowed.has(test.id)) return false
        if (!q.trim()) return true
        return relevanceScore([test.name, test.code, test.department, testLines[test.id] ?? "", ...test.params], q, Boolean(test.popular)) > 0
      })
      .sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)) || a.name.localeCompare(b.name))
  }, [active, q])

  return (
    <Page>
      <section className="menu-hero">
        <div>
          <h1>Find the right test for what you need.</h1>
          <p className="lead">From a routine check to a single concern, the Yanam menu is on this page.</p>
        </div>
        <div className="seal" aria-hidden="true">
          <div>
            <strong>Doctor-signed reports</strong>
            <small>Yanam · 2026</small>
          </div>
        </div>
      </section>

      <div className="menu-head">
        <h2>Test category</h2>
        <div>
          <button type="button" aria-label="Previous categories" disabled={!canScroll.prev} onClick={() => moveRail(-1)}>
            <svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <button type="button" aria-label="Next categories" disabled={!canScroll.next} onClick={() => moveRail(1)}>
            <svg viewBox="0 0 24 24"><path d="M10 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      <div className="cat-row" ref={rail}>
        {menuCategories.map((item) => (
          <button key={item.id} type="button" className={`cat ${concern === item.id ? "on" : ""}`} onClick={() => setConcern(item.id)}>
            <i aria-hidden="true"><CatIcon id={item.id} /></i>
            {item.label}
          </button>
        ))}
      </div>

      <div className="menu-show">
        <p>{active.id === "all" ? "Showing all tests" : `Showing ${active.label}`}</p>
        <label className="menu-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16.5L20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search" aria-label="Search tests" />
        </label>
      </div>

      {rows.length === 0 ? <p className="muted">No test matches that.</p> : null}
      <div className="menu-grid">
        {rows.map((test) => (
          <MenuTest key={test.id} test={test} />
        ))}
      </div>
    </Page>
  )
}

function ScanTests() {
  useTitle("Scans and heart")
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get("q") ?? "")
  const [fasting, setFasting] = useState(false)
  const [homeOnly, setHomeOnly] = useState(false)

  const rows = useMemo(() => {
    return tests
      .filter((test) => {
        if (test.category !== "Radiology" && test.category !== "Cardiology") return false
        if (fasting && !test.fasting) return false
        if (homeOnly && !test.home) return false
        if (!q.trim()) return true
        return relevanceScore([test.name, test.code, test.department, testLines[test.id] ?? "", ...test.params], q, Boolean(test.popular)) > 0
      })
      .sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)) || a.name.localeCompare(b.name))
  }, [fasting, homeOnly, q])

  return (
    <Page>
      <p className="kicker">Centre only</p>
      <h1>Scans and heart tests.</h1>
      <p className="lead">Ultrasound, X-ray, ECG, echo, and the treadmill stay at Ferry Road. A phlebotomist cannot bring them home.</p>
      <div className="actions">
        <input className="control" style={{ maxWidth: 320 }} value={q} onChange={(event) => setQ(event.target.value)} placeholder="Name or code" aria-label="Filter tests" />
      </div>
      <div className="chips" style={{ marginTop: 12 }}>
        <button type="button" className={`chip ${fasting ? "on" : ""}`} onClick={() => setFasting((value) => !value)}>Fasting</button>
        <button type="button" className={`chip ${homeOnly ? "on" : ""}`} onClick={() => setHomeOnly((value) => !value)}>Home collection</button>
      </div>
      <p className="muted">{rows.length} tests</p>
      <div className="catalogue">
        {rows.map((test) => (
          <TestCard key={test.id} test={test} blurb={testLines[test.id]} />
        ))}
      </div>
    </Page>
  )
}

function CatIcon({ id }: { id: string }) {
  if (id === "diabetes" || id === "heart") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12 19s-6-3.6-6-8a3.5 3.5 0 016-2 3.5 3.5 0 016 2c0 4.4-6 8-6 8z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  }
  if (id === "anemia") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12 4s6 6.5 6 10a6 6 0 11-12 0c0-3.5 6-10 6-10z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  }
  if (id === "fever") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M10 14a4 4 0 108 0c0-2-1-3.5-2-6-1.2 2-2 3.2-2 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9 19h8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === "vitamins") {
    return (
      <svg viewBox="0 0 24 24">
        <rect x="8" y="3" width="8" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 12h8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  }
  if (id === "hormones" || id === "thyroid") {
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === "kidney") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M8 6c3-2 8 0 8 6s-2 8-5 8-6-2-6-6 1-6 3-8z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="5" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="5" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="5" y="13" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="13" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function TestDetail() {
  const { id = "" } = useParams()
  const test = testById(id)
  const { addTest } = useStore()
  useTitle(test?.name ?? "Test")
  if (!test) {
    return (
      <Page>
        <h1>That test is not on the menu.</h1>
        <ButtonLink to="/tests">All tests</ButtonLink>
      </Page>
    )
  }
  return (
    <Page>
      <OfferView
        name={test.name}
        fasting={test.fasting}
        audience={test.home ? "Home or centre" : "Ferry Road"}
        tat={test.tat}
        price={test.price}
        mrp={test.mrp}
        home={test.home}
        profiles={[{ id: test.id, name: test.name, params: test.params }]}
        onAdd={() => addTest(test.id)}
      />
    </Page>
  )
}

export function Packages() {
  useTitle("Checkups")
  return (
    <Page>
      <p className="kicker">Checkups</p>
      <h1>Full body checkups</h1>
      <p className="lead">One price for the tests a physician usually orders together.</p>
      <div className="pack-grid section">
        {packages.map((item) => (
          <PackageCard key={item.id} item={item} />
        ))}
      </div>
    </Page>
  )
}

export function PackageDetail() {
  const { id = "" } = useParams()
  const item = packageById(id)
  const { addPackage } = useStore()
  useTitle(item?.name ?? "Checkup")
  if (!item) {
    return (
      <Page>
        <h1>That checkup is not listed.</h1>
        <ButtonLink to="/packages">All checkups</ButtonLink>
      </Page>
    )
  }
  const included = item.testIds.map((testId) => testById(testId)).filter((test) => test !== undefined)
  return (
    <Page>
      <OfferView
        name={item.name}
        fasting={item.fasting}
        audience={item.audience}
        tat={item.tat}
        price={item.price}
        mrp={item.mrp}
        home={included.every((test) => test.home)}
        profiles={included.map((test) => ({ id: test.id, name: test.name, params: test.params }))}
        onAdd={() => addPackage(item.id)}
      />
    </Page>
  )
}
