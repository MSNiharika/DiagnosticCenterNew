import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { referrals, staff } from "../data/network"
import { revenueDays, revenueSeries } from "../data/ops"
import { FLOW } from "../data/types"
import type { Gender, OrderStatus } from "../data/types"
import { useStore } from "../context/Store"
import { inr, phonePretty } from "../lib/utils"
import { Button, Field, Page, useTitle } from "../components/ui"

function Intro({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  useTitle(title)
  return (
    <>
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lead">{copy}</p>
    </>
  )
}

export function TodayScreen() {
  const { orders } = useStore()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"All" | OrderStatus>("All")
  const due = orders.filter((order) => !order.paid).reduce((sum, order) => sum + order.total, 0)
  const review = orders.filter((order) => order.status === "Review").length
  const rows = orders.filter((order) => {
    const hit = `${order.patient} ${order.id} ${order.centre}`.toLowerCase().includes(q.toLowerCase())
    return hit && (status === "All" || order.status === status)
  })
  return (
    <Page>
      <Intro kicker="Lab desk" title="Today on the floor." copy="Every booking, including ones made from the patient site, lands here." />
      <div className="grid-3 section">
        <article className="card"><p className="kicker">Orders</p><h2>{orders.length}</h2></article>
        <article className="card"><p className="kicker">Waiting for a signature</p><h2>{review}</h2></article>
        <article className="card"><p className="kicker">Still unpaid</p><h2>{inr(due)}</h2></article>
      </div>
      <div className="actions">
        <input className="control" style={{ maxWidth: 280 }} value={q} onChange={(event) => setQ(event.target.value)} placeholder="Patient, id, centre" aria-label="Search orders" />
        <select className="control" style={{ maxWidth: 180 }} value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Status">
          <option>All</option>
          {FLOW.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <table>
        <thead><tr><th>Order</th><th>Patient</th><th>Centre</th><th>Status</th><th>Pay</th></tr></thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order.id}>
              <td className="mono">{order.id}</td>
              <td>{order.patient}{order.priority === "Urgent" ? " · Urgent" : ""}</td>
              <td>{order.centre}</td>
              <td>{order.status}</td>
              <td>{order.paid ? "Paid" : inr(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  )
}

export function DeskScreen() {
  const { patients, orders, addPatient, advance } = useStore()
  const [q, setQ] = useState("")
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "Female" as Gender })
  const filtered = patients.filter((patient) => `${patient.name} ${patient.phone} ${patient.mrn}`.toLowerCase().includes(q.toLowerCase()))
  function submit(event: FormEvent) {
    event.preventDefault()
    const age = Number(form.age)
    if (form.name.trim().length < 2 || form.phone.replace(/\D/g, "").length !== 10 || age < 1) return
    addPatient({ name: form.name.trim(), phone: form.phone.replace(/\D/g, ""), age, gender: form.gender, city: "Yanam" })
    setForm({ name: "", phone: "", age: "", gender: "Female" })
  }
  return (
    <Page>
      <Intro kicker="Reception" title="Front desk." copy="Register a walk-in, then check in anyone whose visit is still booked." />
      <div className="grid-2 section">
        <form className="card" onSubmit={submit}>
          <h2>New patient</h2>
          <Field label="Name"><input className="control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Mobile"><input className="control" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
          <Field label="Age"><input className="control" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></Field>
          <Field label="Gender">
            <select className="control" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}>
              <option>Female</option><option>Male</option><option>Other</option>
            </select>
          </Field>
          <Button type="submit">Register</Button>
        </form>
        <div>
          <input className="control" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Name, mobile, or MRN" aria-label="Search patients" />
          {filtered.map((patient) => (
            <p key={patient.mrn} className="line"><span><strong>{patient.name}</strong><span className="muted" style={{ display: "block" }}>{patient.mrn} · {phonePretty(patient.phone)}</span></span><span>{patient.age} · {patient.gender}</span><span /></p>
          ))}
        </div>
      </div>
      <h2 style={{ marginTop: 24 }}>Check in</h2>
      {orders.filter((order) => order.status === "Booked").map((order) => (
        <div key={order.id} className="line">
          <span>{order.patient} · {order.slot} · {order.centre}</span>
          <span />
          <Button type="button" onClick={() => advance(order.id)}>Check in</Button>
        </div>
      ))}
    </Page>
  )
}

export function SamplesScreen() {
  const { orders, advance, setPriority } = useStore()
  const [tab, setTab] = useState<OrderStatus | "Open">("Open")
  const rows = orders.filter((order) => (tab === "Open" ? order.status !== "Released" : order.status === tab))
  return (
    <Page>
      <Intro kicker="Accession" title="Move a sample one step." copy="Booked, collected, accessioned, processing, review, then released." />
      <div className="chips">
        {(["Open", ...FLOW] as const).map((item) => (
          <button key={item} type="button" className={`chip ${tab === item ? "on" : ""}`} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {rows.map((order) => (
        <article key={order.id} className="card" style={{ marginTop: 12 }}>
          <p className="mono">{order.id} · {order.status} · {order.priority}</p>
          <h2>{order.patient}</h2>
          <p className="muted">{order.items.map((item) => item.name).join(", ")}</p>
          <div className="actions">
            {order.status !== "Released" && <Button type="button" onClick={() => advance(order.id)}>Next step</Button>}
            <Button type="button" variant="ghost" onClick={() => setPriority(order.id)}>{order.priority === "Urgent" ? "Mark routine" : "Mark urgent"}</Button>
          </div>
        </article>
      ))}
    </Page>
  )
}

export function WorklistScreen() {
  const { orders, setResult } = useStore()
  const rows = orders.filter((order) => ["Accessioned", "Processing", "Review"].includes(order.status))
  return (
    <Page>
      <Intro kicker="Analysers" title="Type the results." copy="If a number sits outside the reference, it marks itself high or low." />
      {rows.map((order) => (
        <article key={order.id} className="card" style={{ marginTop: 12 }}>
          <h2>{order.patient} <span className="muted">{order.id}</span></h2>
          {order.results.map((row, index) => (
            <label key={`${row.name}-${index}`} className="line">
              <span>{row.name}{row.flag ? ` · ${row.flag}` : ""}</span>
              <input className="control" value={row.value} aria-label={row.name} onChange={(event) => setResult(order.id, index, event.target.value)} />
              <span className="muted">{row.ref} {row.unit}</span>
            </label>
          ))}
        </article>
      ))}
      {rows.length === 0 && <p className="muted">Nothing is on the bench.</p>}
    </Page>
  )
}

export function ValidateScreen() {
  const { orders, release, setNote } = useStore()
  const rows = orders.filter((order) => order.status === "Review")
  return (
    <Page>
      <Intro kicker="Pathologist" title="Sign a report." copy="Every field needs a value. The patient sees it the moment you release it." />
      {rows.map((order) => {
        const ready = order.results.length > 0 && order.results.every((row) => row.value.trim())
        return (
          <article key={order.id} className="card" style={{ marginTop: 12 }}>
            <h2>{order.patient}</h2>
            <p className="muted">{order.id} · {order.department}</p>
            <ul>{order.results.map((row) => <li key={row.name}>{row.name}: {row.value || "—"} {row.flag ?? ""}</li>)}</ul>
            <Field label="Note"><textarea className="control" rows={2} value={order.note} onChange={(event) => setNote(order.id, event.target.value)} /></Field>
            {!ready && <p className="err">Fill the results page before signing.</p>}
            <Button type="button" disabled={!ready} onClick={() => release(order.id)}>Release report</Button>
          </article>
        )
      })}
      {rows.length === 0 && <p className="muted">Nothing is waiting for a signature.</p>}
    </Page>
  )
}

export function BillingScreen() {
  const { orders, setPaid } = useStore()
  const [onlyDue, setOnlyDue] = useState(false)
  const rows = orders.filter((order) => (onlyDue ? !order.paid : true))
  const collected = orders.filter((order) => order.paid).reduce((sum, order) => sum + order.total, 0)
  const due = orders.filter((order) => !order.paid).reduce((sum, order) => sum + order.total, 0)
  return (
    <Page>
      <Intro kicker="Counter" title="Billing." copy="UPI and card bookings are already marked paid. Pay-at-centre dues wait here." />
      <p>Collected {inr(collected)} · Still due {inr(due)}</p>
      <button type="button" className="ghost" onClick={() => setOnlyDue((value) => !value)}>{onlyDue ? "Show every bill" : "Show only dues"}</button>
      {rows.map((order) => (
        <div key={order.id} className="line">
          <span><strong>{order.patient}</strong><span className="muted" style={{ display: "block" }}>{order.id} · {order.pay}</span></span>
          <span>{inr(order.total)}</span>
          {order.paid ? <span>Paid</span> : <Button type="button" onClick={() => setPaid(order.id)}>Record payment</Button>}
        </div>
      ))}
    </Page>
  )
}

export function InventoryScreen() {
  const { inventory, reorder } = useStore()
  return (
    <Page>
      <Intro kicker="Stores" title="Tubes, reagents, contrast." copy="Anything at or under the reorder line is marked low." />
      <table>
        <thead><tr><th>Item</th><th>On hand</th><th>Reorder at</th><th>On order</th><th></th></tr></thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.sku}>
              <td>{item.name}{item.onHand <= item.reorderAt ? " · Low" : ""}<span className="muted" style={{ display: "block" }}>{item.sku} · exp {item.expiry}</span></td>
              <td>{item.onHand} {item.unit}</td>
              <td>{item.reorderAt}</td>
              <td>{item.onOrder}</td>
              <td><Button type="button" variant="ghost" onClick={() => reorder(item.sku)}>Reorder {item.reorderQty}</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  )
}

export function LogisticsScreen() {
  const { riders, advanceRider, orders } = useStore()
  const homes = orders.filter((order) => order.mode === "Home collection")
  return (
    <Page>
      <Intro kicker="Routes" title="Home visits." copy="Move a rider from assigned, to en route, to collected, to dropped at the lab." />
      <div className="grid-2">
        {riders.map((rider) => (
          <article key={rider.id} className="card">
            <h2>{rider.name}</h2>
            <p className="muted">{rider.zone} · {rider.stops} stops · {rider.window}</p>
            <p>{rider.status}</p>
            <Button type="button" disabled={rider.status === "Dropped at lab"} onClick={() => advanceRider(rider.id)}>Next step</Button>
          </article>
        ))}
      </div>
      <h2 style={{ marginTop: 20 }}>Home bookings</h2>
      {homes.map((order) => (
        <p key={order.id}>{order.patient} · {order.slot} · {order.address} · {order.status}</p>
      ))}
    </Page>
  )
}

export function ReferralsScreen() {
  const payout = referrals.reduce((sum, row) => sum + row.payout, 0)
  return (
    <Page>
      <Intro kicker="Clinics" title="Referrals." copy={`${inr(payout)} is still to be settled this month.`} />
      {referrals.map((row) => (
        <div key={row.name} className="line">
          <span><strong>{row.name}</strong><span className="muted" style={{ display: "block" }}>{row.clinic}</span></span>
          <span>{row.orders} orders · {inr(row.revenue)}</span>
          <span>{inr(row.payout)} due</span>
        </div>
      ))}
    </Page>
  )
}

export function QualityScreen() {
  const { qc, logQc } = useStore()
  return (
    <Page>
      <Intro kicker="Before patients" title="Morning controls." copy="Log a control before that analyte is trusted." />
      <div className="grid-3">
        {qc.map((lot) => (
          <article key={lot.id} className="card">
            <p className={`pill ${lot.status === "Warning" ? "warn" : ""}`}>{lot.status}</p>
            <h2>{lot.name}</h2>
            <p className="muted">{lot.level} · {lot.instrument}</p>
            <p>Last run {lot.last} · {lot.runs} today</p>
            <Button type="button" onClick={() => logQc(lot.id)}>Log QC</Button>
          </article>
        ))}
      </div>
    </Page>
  )
}

export function PeopleScreen() {
  const [shift, setShift] = useState("All")
  const rows = staff.filter((person) => shift === "All" || person.state === shift)
  return (
    <Page>
      <Intro kicker="Roster" title="Who is on the floor." copy="Filter by who is working, off, or on leave." />
      <div className="chips">
        {["All", "On floor", "Off", "Leave"].map((item) => (
          <button key={item} type="button" className={`chip ${shift === item ? "on" : ""}`} onClick={() => setShift(item)}>{item}</button>
        ))}
      </div>
      <div className="grid-2 section">
        {rows.map((person) => (
          <article key={person.name} className="card">
            <h2 style={{ fontSize: "1.4rem" }}>{person.name}</h2>
            <p className="muted">{person.role} · {person.centre} · {person.shift}</p>
            <span className="pill">{person.state}</span>
          </article>
        ))}
      </div>
    </Page>
  )
}

export function InsightsScreen() {
  const { orders } = useStore()
  const max = Math.max(...revenueSeries)
  const mix = useMemo(() => {
    const counts = new Map<string, number>()
    for (const order of orders) counts.set(order.department, (counts.get(order.department) ?? 0) + 1)
    return [...counts.entries()]
  }, [orders])
  return (
    <Page>
      <Intro kicker="This week" title="Collections and mix." copy="The bars are a sample week. The departments are counted from the orders on this desk." />
      <div className="card" style={{ display: "flex", alignItems: "end", gap: 12, height: 220 }}>
        {revenueSeries.map((value, index) => (
          <div key={revenueDays[index]} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: `${(value / max) * 150}px`, background: "#0e3c43", borderRadius: "8px 8px 0 0" }} />
            <span className="muted">{revenueDays[index]}</span>
          </div>
        ))}
      </div>
      <div className="section">
        {mix.map(([name, count]) => (
          <p key={name} style={{ display: "flex", justifyContent: "space-between" }}><span>{name}</span><span>{count}</span></p>
        ))}
      </div>
    </Page>
  )
}

export function CallbacksScreen() {
  const { orders } = useStore()
  const [called, setCalled] = useState<string[]>([])
  const rows = orders.filter((order) => order.status === "Released" && order.results.some((row) => row.flag))
  return (
    <Page>
      <Intro kicker="New module" title="Call about an out-of-range result." copy="Released reports with a high or low value. Mark the call once the patient has heard it. This list did not exist on the old desk." />
      {rows.map((order) => (
        <article key={order.id} className="card" style={{ marginTop: 12 }}>
          <h2>{order.patient}</h2>
          <p className="muted">{order.id} · {phonePretty(order.phone)}</p>
          <ul>
            {order.results.filter((row) => row.flag).map((row) => (
              <li key={row.name}>{row.name}: {row.value} {row.flag}</li>
            ))}
          </ul>
          <Button type="button" variant={called.includes(order.id) ? "ghost" : "solid"} onClick={() => setCalled((ids) => ids.includes(order.id) ? ids : [...ids, order.id])}>
            {called.includes(order.id) ? "Called" : "Mark called"}
          </Button>
        </article>
      ))}
      {rows.length === 0 && <p className="muted">No released report is outside the range right now.</p>}
    </Page>
  )
}
