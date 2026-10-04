import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { testById, tests } from "../data/catalog"
import { centres } from "../data/network"
import type { Gender, PayMode, VisitMode } from "../data/types"
import type { Order } from "../data/types"
import { useFamily } from "../context/Family"
import { useStore } from "../context/Store"
import { SLOT_TIMES, digits, inr, slotPassed, upcomingDays } from "../lib/utils"
import { Button, ButtonLink, Field, Page, useTitle } from "../components/ui"

const serviceFor: Record<string, string> = {
  "usg-abd": "Ultrasound",
  xray: "Digital X-ray",
  ecg: "ECG",
  echo: "ECG",
  tmt: "ECG",
  "mri-brain": "MRI",
  "ct-chest": "CT",
  mammo: "Mammography",
  hpv: "Women's room",
}

export function Book() {
  useTitle("Book")
  const [params] = useSearchParams()
  const { cart, cartTotal, addTest, removeItem, placeOrder, session, accountFor } = useStore()
  const { members } = useFamily()
  const mine = session?.role === "patient" ? accountFor(session.phone) : null
  const days = useMemo(() => upcomingDays(5), [])
  const firstOpen = SLOT_TIMES.every((time) => slotPassed(0, time)) ? 1 : 0
  const [mode, setMode] = useState<VisitMode>(params.get("mode") === "home" ? "Home collection" : "Centre visit")
  const [centreId, setCentreId] = useState(centres[0].id)
  const [day, setDay] = useState(firstOpen)
  const [time, setTime] = useState(SLOT_TIMES.find((slot) => !slotPassed(firstOpen, slot)) ?? SLOT_TIMES[0])
  const [promo, setPromo] = useState("")
  const [promoOn, setPromoOn] = useState(false)
  const [pay, setPay] = useState<PayMode>("UPI")
  const [who, setWho] = useState(params.get("who") ?? "")
  const [error, setError] = useState("")
  const [done, setDone] = useState<Order | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "Female" as Gender, address: "" })
  const member = members.find((item) => item.id === who)

  useEffect(() => {
    if (member) {
      setForm((current) => ({ ...current, name: member.name, age: member.age, gender: member.gender }))
      return
    }
    if (!mine) return
    setForm((current) => ({ ...current, name: mine.name, phone: mine.phone, gender: mine.gender }))
  }, [member, mine])

  const centre = centres.find((item) => item.id === centreId) ?? centres[0]
  const testIds = [...new Set(cart.flatMap((item) => item.testIds))]
  const homeBlocked = testIds.map((id) => testById(id)).filter((test) => test && !test.home)
  const missing = testIds.filter((id) => {
    const token = serviceFor[id]
    if (!token) return !centre.services.includes("Pathology")
    return !centre.services.includes(token)
  })
  const discount = promoOn ? Math.round(cartTotal * 0.2) : 0
  const homeFee = mode === "Home collection" && cartTotal > 0 && cartTotal < 500 ? 150 : 0
  const total = Math.max(0, cartTotal - discount + homeFee)

  function applyPromo() {
    if (promo.trim().toUpperCase() === "AURORA20") {
      setPromoOn(true)
      setError("")
    } else {
      setPromoOn(false)
      setError("That code is not active. Try AURORA20.")
    }
  }

  function confirm() {
    const phone = mine && !member ? mine.phone : digits(form.phone)
    const age = Number(form.age)
    const patientName = (member ? member.name : mine ? mine.name : form.name).trim()
    if (cart.length === 0) return setError("Add at least one test.")
    if (slotPassed(day, time)) return setError("That time has already passed.")
    if (mode === "Home collection" && homeBlocked.length > 0) return setError(`${homeBlocked.map((test) => test?.name).join(", ")} must be done at the centre.`)
    if (missing.length > 0) return setError(`${centre.name} does not offer ${missing.map((id) => testById(id)?.name).join(", ")}.`)
    if (patientName.length < 2) return setError("Add the patient's name.")
    if (phone.length !== 10) return setError("Use a 10-digit mobile number.")
    if (!Number.isFinite(age) || age < 1 || age > 110) return setError("Age should be between 1 and 110.")
    if (mode === "Home collection" && form.address.trim().length < 8) return setError("Add the full collection address.")
    const order = placeOrder({
      mode,
      centre: centre.name,
      slot: `${days[day]} · ${time}`,
      address: mode === "Home collection" ? form.address.trim() : undefined,
      patient: { name: patientName, phone, age, gender: member?.gender ?? mine?.gender ?? form.gender },
      total,
      pay,
    })
    setDone(order)
    setError("")
  }

  if (done) {
    return (
      <Page>
        <p className="kicker">Booked</p>
        <h1>{done.id}</h1>
        <p className="lead">{done.patient} is booked for {done.slot} at {done.centre}. {done.mode}. This is a demonstration: nothing was charged and nobody is on the way.</p>
        <div className="card" style={{ marginTop: 16 }}>
          <p>{done.items.map((item) => item.name).join(", ")}</p>
          <p>{inr(done.total)} · {done.paid ? "Marked paid" : "Pay at the centre"}</p>
        </div>
        <div className="actions">
          <ButtonLink to={`/reports?order=${done.id}`}>Track the report</ButtonLink>
          <ButtonLink to="/console" variant="ghost">See it on the lab desk</ButtonLink>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <p className="kicker">Booking</p>
      <h1>Choose the tests, then the time.</h1>
      <div className="grid-2">
        <div>
          {cart.length === 0 && (
            <div className="card">
              <p>Your list is empty. Add a common test, or browse the menu.</p>
              <div className="chips" style={{ marginTop: 10 }}>
                {tests.filter((test) => test.popular).slice(0, 5).map((test) => (
                  <button key={test.id} type="button" className="chip" onClick={() => addTest(test.id)}>+ {test.name}</button>
                ))}
              </div>
              <div className="actions">
                <ButtonLink to="/tests" variant="ghost">Browse tests</ButtonLink>
                <ButtonLink to="/packages" variant="ghost">Browse checkups</ButtonLink>
              </div>
            </div>
          )}
          {cart.map((item) => (
            <div key={item.key} className="line">
              <span><strong>{item.name}</strong><span className="muted" style={{ display: "block" }}>{item.kind === "package" ? "Checkup" : "Single test"}</span></span>
              <span>{inr(item.price)}</span>
              <button type="button" className="ghost" onClick={() => removeItem(item.key)}>Remove</button>
            </div>
          ))}
          <div className="actions">
            <input className="control" style={{ maxWidth: 220 }} value={promo} onChange={(event) => setPromo(event.target.value)} placeholder="Code AURORA20" aria-label="Offer code" />
            <Button type="button" variant="ghost" onClick={applyPromo}>Apply</Button>
          </div>
          {promoOn && <p>20% off applied.</p>}

          <h2 style={{ marginTop: 22 }}>Where</h2>
          <div className="chips">
            {(["Centre visit", "Home collection"] as VisitMode[]).map((option) => (
              <button key={option} type="button" className={`chip ${mode === option ? "on" : ""}`} onClick={() => setMode(option)}>{option}</button>
            ))}
          </div>
          <Field label={mode === "Home collection" ? "Samples go to" : "Centre"}>
            <select className="control" value={centreId} onChange={(event) => setCentreId(event.target.value)}>
              {centres.map((item) => (
                <option key={item.id} value={item.id}>{item.name} — {item.hours}</option>
              ))}
            </select>
          </Field>
          <p className="muted">{centre.services.join(" · ")}</p>

          <h2 style={{ marginTop: 22 }}>When</h2>
          <div className="chips">
            {days.map((label, index) => (
              <button key={label} type="button" className={`chip ${day === index ? "on" : ""}`} onClick={() => setDay(index)}>{label}</button>
            ))}
          </div>
          <div className="chips" style={{ marginTop: 8 }}>
            {SLOT_TIMES.map((slot) => (
              <button key={slot} type="button" className={`chip ${time === slot ? "on" : ""}`} disabled={slotPassed(day, slot)} onClick={() => setTime(slot)}>{slot}</button>
            ))}
          </div>

          <h2 style={{ marginTop: 22 }}>Who</h2>
          {members.length > 0 && (
            <Field label="Family member">
              <select className="control" value={who} onChange={(event) => setWho(event.target.value)}>
                <option value="">Myself</option>
                {members.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} · {item.relation}</option>
                ))}
              </select>
            </Field>
          )}
          <div className="grid-2">
            <Field label="Patient name"><input className="control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="Mobile"><input className="control" inputMode="numeric" value={member ? form.phone : mine ? mine.phone : form.phone} readOnly={Boolean(mine) && !member} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
            <Field label="Age"><input className="control" inputMode="numeric" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></Field>
            <Field label="Gender">
              <select className="control" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
          {mode === "Home collection" && (
            <Field label="Collection address">
              <textarea className="control" rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </Field>
          )}
          <p className="kicker" style={{ marginTop: 16 }}>Payment</p>
          <div className="chips">
            {(["UPI", "Card", "Pay at centre"] as PayMode[]).map((option) => (
              <button key={option} type="button" className={`chip ${pay === option ? "on" : ""}`} onClick={() => setPay(option)}>{option}</button>
            ))}
          </div>
          {error && <p className="err">{error}</p>}
          <div className="actions">
            <Button type="button" onClick={confirm}>Confirm booking</Button>
            <Link to="/family">Add a family member</Link>
          </div>
        </div>
        <aside className="card" style={{ alignSelf: "start" }}>
          <h2>Summary</h2>
          {cart.map((item) => (
            <p key={item.key} style={{ display: "flex", justifyContent: "space-between" }}><span>{item.name}</span><span>{inr(item.price)}</span></p>
          ))}
          <p style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{inr(cartTotal)}</span></p>
          {discount > 0 && <p style={{ display: "flex", justifyContent: "space-between" }}><span>AURORA20</span><span>−{inr(discount)}</span></p>}
          {homeFee > 0 && <p style={{ display: "flex", justifyContent: "space-between" }}><span>Home visit under ₹500</span><span>{inr(homeFee)}</span></p>}
          <p style={{ display: "flex", justifyContent: "space-between" }}><strong>Total</strong><strong>{inr(total)}</strong></p>
          <p className="muted">{mode} · {centre.name} · {days[day]} {time}</p>
          <Link to="/prescription">Have a prescription instead?</Link>
        </aside>
      </div>
    </Page>
  )
}
