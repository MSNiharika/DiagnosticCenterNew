import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { packageById, packageWorth, packages, testById } from "../data/catalog"
import { concerns, testsForConcern } from "../data/concerns"
import { packageLines, testLines } from "../data/voice"
import type { Gender } from "../data/types"
import { useFamily } from "../context/Family"
import { useStore } from "../context/Store"
import { inr } from "../lib/utils"
import { Button, ButtonLink, Field, Page, useTitle } from "../components/ui"

export function Guide() {
  useTitle("Help me choose")
  const [params, setParams] = useSearchParams()
  const active = params.get("need") ?? concerns[0].id
  const { addTest } = useStore()
  const rows = testsForConcern(active)
  const concern = concerns.find((item) => item.id === active)

  return (
    <Page>
      <p className="kicker">Help me choose</p>
      <h1>Tell us the reason. We’ll show the tests.</h1>
      <p className="lead">These are the same tests on the Yanam menu. Nothing here is a diagnosis, and you can remove anything before you book.</p>
      <div className="chips" style={{ marginTop: 16 }}>
        {concerns.map((item) => (
          <button key={item.id} type="button" className={`chip ${active === item.id ? "on" : ""}`} onClick={() => setParams({ need: item.id })}>
            {item.label}
          </button>
        ))}
      </div>
      <h2 style={{ marginTop: 22 }}>{concern?.label}</h2>
      {rows.map((test) => (
        <div key={test.id} className="line">
          <div>
            <Link to={`/tests/${test.id}`}><strong>{test.name}</strong></Link>
            <p className="muted" style={{ margin: "4px 0 0" }}>{testLines[test.id]} · {test.tat}</p>
          </div>
          <span>{inr(test.price)}</span>
          <Button type="button" onClick={() => addTest(test.id)}>Add</Button>
        </div>
      ))}
      <div className="actions">
        <ButtonLink to="/book">Book these</ButtonLink>
      </div>
    </Page>
  )
}

export function Compare() {
  useTitle("Compare prices")
  const [params, setParams] = useSearchParams()
  const selected = packageById(params.get("pkg") ?? "") ?? packages[0]
  const alone = packageWorth(selected)
  const rows = selected.testIds.map((id) => testById(id)).filter((test) => test !== undefined)

  return (
    <Page>
      <p className="kicker">Compare prices</p>
      <h1>Checkup, or each test on its own.</h1>
      <div className="chips">
        {packages.map((item) => (
          <button key={item.id} type="button" className={`chip ${selected.id === item.id ? "on" : ""}`} onClick={() => setParams({ pkg: item.id })}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="grid-3 section">
        <article className="card">
          <p className="kicker">As a checkup</p>
          <h2>{selected.name}</h2>
          <p className="display" style={{ fontSize: "2.4rem" }}>{inr(selected.price)}</p>
          <p className="muted">{packageLines[selected.id]}</p>
        </article>
        <article className="card">
          <p className="kicker">Tests bought separately</p>
          <p className="display" style={{ fontSize: "2.4rem" }}>{inr(alone)}</p>
          <p className="muted">{rows.length} tests at their own prices.</p>
        </article>
        <article className="ticket">
          <p className="kicker">Difference</p>
          <p className="display" style={{ fontSize: "2.4rem" }}>{inr(Math.max(0, alone - selected.price))}</p>
          <p>Saved by booking {selected.name} together.</p>
        </article>
      </div>
      <div className="section">
        {rows.map((test) => (
          <div key={test.id} className="line">
            <Link to={`/tests/${test.id}`}>{test.name}</Link>
            <span>{inr(test.price)}</span>
            <span className="muted">{test.fasting ? "Fasting" : "No fasting"}</span>
          </div>
        ))}
      </div>
    </Page>
  )
}

export function Family() {
  useTitle("Family")
  const { members, add, remove } = useFamily()
  const [form, setForm] = useState({ name: "", age: "", gender: "Female" as Gender, relation: "Parent" })
  const [error, setError] = useState("")

  function submit(event: FormEvent) {
    event.preventDefault()
    const age = Number(form.age)
    if (form.name.trim().length < 2 || !Number.isFinite(age) || age < 1 || age > 110) {
      setError("Add a name and an age between 1 and 110.")
      return
    }
    add({ name: form.name.trim(), age: String(age), gender: form.gender, relation: form.relation })
    setForm({ name: "", age: "", gender: "Female", relation: form.relation })
    setError("")
  }

  return (
    <Page>
      <p className="kicker">Family</p>
      <h1>Book for someone else.</h1>
      <p className="lead">Save a parent, partner, or child on this device. On the booking page, pick their name. The report still uses the mobile number you enter.</p>
      <form onSubmit={submit} className="grid-2" style={{ marginTop: 16 }}>
        <Field label="Name"><input className="control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Age"><input className="control" inputMode="numeric" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></Field>
        <Field label="Gender">
          <select className="control" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Relation">
          <select className="control" value={form.relation} onChange={(event) => setForm({ ...form, relation: event.target.value })}>
            {["Parent", "Partner", "Child", "Sibling", "Other"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Button type="submit">Save</Button>
      </form>
      {error && <p className="err">{error}</p>}
      <div className="section">
        {members.map((member) => (
          <div key={member.id} className="line">
            <span><strong>{member.name}</strong><span className="muted" style={{ display: "block" }}>{member.relation} · {member.age} · {member.gender}</span></span>
            <ButtonLink to={`/book?who=${member.id}`} variant="ghost">Book for {member.name.split(" ")[0]}</ButtonLink>
            <button type="button" className="ghost" onClick={() => remove(member.id)}>Remove</button>
          </div>
        ))}
        {members.length === 0 && <p className="muted">Nobody saved yet.</p>}
      </div>
    </Page>
  )
}

const plans = [
  { id: "year", name: "Twice a year", packageId: "essential", rhythm: "January and July", line: "Essential 6, twice. Book each visit when the month comes." },
  { id: "sugar", name: "Sugar follow-up", packageId: "diabetes", rhythm: "Every quarter", line: "Diabetes Watch between clinic visits." },
  { id: "once", name: "The long morning", packageId: "executive", rhythm: "Once a year", line: "Executive Platinum: blood, heart, and an abdominal ultrasound." },
  { id: "fever", name: "Keep a fever panel ready", packageId: "fever", rhythm: "When a fever starts", line: "Fever Panel is already composed. No fasting." },
]

export function Plans() {
  useTitle("Yearly plans")
  const { addPackage } = useStore()
  return (
    <Page>
      <p className="kicker">Yearly plans</p>
      <h1>A rhythm, using checkups you already know.</h1>
      <p className="lead">A plan does not charge a subscription. It adds the real checkup to your booking at the Yanam price.</p>
      <div className="grid-2 section">
        {plans.map((plan) => {
          const item = packageById(plan.packageId)
          if (!item) return null
          return (
            <article key={plan.id} className="card">
              <p className="kicker">{plan.rhythm}</p>
              <h2>{plan.name}</h2>
              <p>{plan.line}</p>
              <p className="muted">{item.name} · {inr(item.price)} · {item.testIds.length} tests</p>
              <Button type="button" onClick={() => addPackage(item.id)}>Add {item.name}</Button>
            </article>
          )
        })}
      </div>
    </Page>
  )
}

export function Prep() {
  useTitle("How to prepare")
  const { cart } = useStore()
  const items = useMemo(() => {
    const ids = [...new Set(cart.flatMap((item) => item.testIds))]
    return ids.map((id) => testById(id)).filter((test) => test !== undefined)
  }, [cart])
  const fasting = items.filter((test) => test.fasting)
  const centreOnly = items.filter((test) => !test.home)

  return (
    <Page>
      <p className="kicker">How to prepare</p>
      <h1>{items.length ? "For what is in your cart." : "Add a test to see the preparation."}</h1>
      {items.length === 0 && (
        <div className="actions">
          <ButtonLink to="/tests">Browse tests</ButtonLink>
          <ButtonLink to="/packages" variant="ghost">Browse checkups</ButtonLink>
        </div>
      )}
      {fasting.length > 0 && <p className="card">Fasting: {fasting.map((test) => test.name).join(", ")}. Water is allowed. Skip the morning tea.</p>}
      {centreOnly.length > 0 && <p className="card">Come to Ferry Road for {centreOnly.map((test) => test.name).join(", ")}. These cannot be collected at home.</p>}
      {items.map((test) => (
        <article key={test.id} className="line">
          <div>
            <strong>{test.name}</strong>
            <p style={{ margin: "4px 0 0" }}>{test.prep}</p>
          </div>
          <span className={`pill ${test.fasting ? "warn" : ""}`}>{test.fasting ? "Fasting" : "No fasting"}</span>
          <span className="muted">{test.home ? "Home or centre" : "Centre"}</span>
        </article>
      ))}
      {items.length > 0 && <ButtonLink to="/book">Continue to a time</ButtonLink>}
      <p className="muted" style={{ marginTop: 24 }}>
        Lipid profile, iron studies, abdominal ultrasound, and the treadmill ask you to fast. A blood count, thyroid profile, vitamin D, ECG, and X-ray do not.
      </p>
    </Page>
  )
}
