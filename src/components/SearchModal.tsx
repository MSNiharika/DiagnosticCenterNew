import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { packages, testById, tests } from "../data/catalog"
import type { Package, Test } from "../data/types"
import { useStore } from "../context/Store"
import { inr } from "../lib/utils"

const suggestions = ["CBC", "Thyroid", "HbA1c", "Vitamin D", "Lipid", "Fever"]

export function SearchModal({ open, query, onClose }: { open: boolean; query: string; onClose: () => void }) {
  const { addTest, addPackage } = useStore()
  const [q, setQ] = useState(query)
  const [tab, setTab] = useState<"tests" | "packages">("tests")
  const field = useRef<HTMLInputElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    setQ(query)
    setTab("tests")
    const timer = window.setTimeout(() => field.current?.focus(), 30)
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open, query])

  const needle = q.trim().toLowerCase()
  const foundTests = useMemo(() => tests.filter((test) => hitTest(test, needle)), [needle])
  const foundPacks = useMemo(() => packages.filter((item) => hitPack(item, needle)), [needle])
  const shownTests = needle ? foundTests : tests.filter((test) => test.popular)
  const shownPacks = needle ? foundPacks : packages

  if (!open) return null

  return (
    <div className="help-back" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="finder" role="dialog" aria-modal="true" aria-label="Search tests">
        <div className="finder-bar">
          <button type="button" className="finder-back" onClick={onClose} aria-label="Close search">‹</button>
          <input
            ref={field}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search for tests or checkups"
            aria-label="Search for tests or checkups"
          />
          {q && (
            <button type="button" className="finder-clear" onClick={() => setQ("")} aria-label="Clear search">×</button>
          )}
        </div>
        <div className="finder-tabs">
          <button type="button" className={tab === "tests" ? "on" : ""} onClick={() => setTab("tests")}>
            Tests {needle && <em>{foundTests.length}</em>}
          </button>
          <button type="button" className={tab === "packages" ? "on" : ""} onClick={() => setTab("packages")}>
            Packages {needle && <em>{foundPacks.length}</em>}
          </button>
        </div>
        <div className="finder-body">
          {needle && <p className="finder-for">Showing results for {q.trim()}</p>}
          <p className="finder-label">Popular searches</p>
          <div className="chips">
            {suggestions.map((item) => {
              const on = needle === item.toLowerCase()
              return (
                <button key={item} type="button" className={`chip ${on ? "on" : ""}`} onClick={() => setQ(on ? "" : item)}>
                  {item}
                  {on && <span aria-hidden="true"> ×</span>}
                </button>
              )
            })}
          </div>
          <p className="finder-label">{needle ? "Matches" : tab === "tests" ? "Frequently booked tests" : "Checkups"}</p>
          {tab === "tests" ? (
            shownTests.length === 0 ? <p className="muted">No test by that name.</p> : shownTests.map((test) => (
              <article key={test.id} className="finder-row">
                <div>
                  <strong>{test.name}</strong>
                  <span>{inr(test.price)}</span>
                </div>
                <p className="finder-tat">Report in {test.tat}</p>
                <p className="muted">Also known as: {test.params.slice(0, 4).join(", ")}</p>
                <div className="finder-actions">
                  <Link to={`/tests/${test.id}`} onClick={onClose}>View details</Link>
                  <button type="button" className="solid" onClick={() => addTest(test.id)}>Add to cart</button>
                </div>
              </article>
            ))
          ) : shownPacks.length === 0 ? <p className="muted">No checkup by that name.</p> : shownPacks.map((item) => (
            <article key={item.id} className="finder-row">
              <div>
                <strong>{item.name}</strong>
                <span>{inr(item.price)}</span>
              </div>
              <p className="finder-tat">Report in {item.tat}</p>
              <p className="muted">{item.summary}</p>
              <div className="finder-actions">
                <Link to={`/packages/${item.id}`} onClick={onClose}>View details</Link>
                <button type="button" className="solid" onClick={() => addPackage(item.id)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function hitTest(test: Test, needle: string) {
  if (!needle) return true
  const blob = [test.name, test.code, test.sample, test.about, ...test.params].join(" ").toLowerCase()
  return blob.includes(needle)
}

function hitPack(item: Package, needle: string) {
  if (!needle) return true
  const inside = item.testIds.map((id) => testById(id)?.name ?? "").join(" ")
  return `${item.name} ${item.summary} ${item.audience} ${inside}`.toLowerCase().includes(needle)
}
