import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useParams } from "react-router-dom"
import { tests } from "../data/catalog"
import { equipment, journey, qualityMarks } from "../data/company"
import { centreById, centrePhone, centres, doctors } from "../data/network"
import { useStore } from "../context/Store"
import { Button, ButtonLink, Field, Page, useTitle } from "../components/ui"

export function Centres() {
  useTitle("Centres")
  return (
    <Page>
      <p className="kicker">Where to go</p>
      <h1>Ferry Road, and a morning desk in Mettakuru.</h1>
      <div className="grid-2 section">
        {centres.map((centre) => (
          <Link key={centre.id} to={`/centres/${centre.id}`} className="card">
            <p className="kicker">{centre.hours}</p>
            <h2>{centre.name}</h2>
            <p>{centre.address}</p>
            <p className="muted">{centre.services.join(" · ")}</p>
          </Link>
        ))}
      </div>
    </Page>
  )
}

export function CentreDetail() {
  const { id = "" } = useParams()
  const centre = centreById(id)
  useTitle(centre?.name ?? "Centre")
  if (!centre) return <Page><h1>That centre is not listed.</h1><ButtonLink to="/centres">All centres</ButtonLink></Page>
  return (
    <Page>
      <p className="kicker">{centre.city}</p>
      <h1>{centre.name}</h1>
      <p className="lead">{centre.note}</p>
      <p>{centre.address}</p>
      <p>{centre.hours} · {centre.phone}</p>
      <div className="chips">{centre.services.map((service) => <span key={service} className="chip">{service}</span>)}</div>
      <div className="actions">
        <ButtonLink to="/book">Book here</ButtonLink>
        <ButtonLink to="/collection" variant="ghost">Home collection</ButtonLink>
      </div>
    </Page>
  )
}

export function Collection() {
  useTitle("Home collection")
  return (
    <Page>
      <p className="kicker">Home collection</p>
      <h1>A named person, a sealed kit, the time you picked.</h1>
      <p className="lead">Blood and urine across Yanam town, Mettakuru, Dariyalatippa, and Farampeta. The sample joins the same queue as a draw at Ferry Road. Visits under ₹500 add ₹150. Over that, the visit is free.</p>
      <div className="grid-3 section">
        {[
          ["From 7:00 AM", "The last home slot is 5:30 PM."],
          ["Cold box", "A warm tube is rejected and drawn again."],
          ["Same report", "You track it from collected to signed."],
        ].map(([title, copy]) => (
          <article key={title} className="card"><h2>{title}</h2><p className="muted">{copy}</p></article>
        ))}
      </div>
      <h2 style={{ marginTop: 24 }}>Comes to the door</h2>
      <p>Blood counts, thyroid, vitamins, fever panels, urine.</p>
      <h2>Stays at the centre</h2>
      <p>Ultrasound, X-ray, ECG, echo, treadmill, HPV swab, mammography.</p>
      <ButtonLink to="/book?mode=home">Book a home slot</ButtonLink>
    </Page>
  )
}

export function About() {
  useTitle("About us")
  return (
    <Page>
      <p className="kicker">About us</p>
      <h1>Opened on Ferry Road in 2026.</h1>
      <p className="lead">Aurora Diagnostics is a new lab for Yanam. Pathology, ultrasound, digital X-ray, and ECG share one building, and a report leaves only after a doctor signs it.</p>
      <div className="grid-3 section">
        {qualityMarks.map((item) => (
          <article key={item.name} className="card">
            <h2>{item.name}</h2>
            <p className="muted">{item.body}</p>
          </article>
        ))}
      </div>

      <section className="section">
        <h2>Our journey</h2>
        <p className="muted">From the first morning on Ferry Road to a collection desk in Mettakuru.</p>
        <ol className="journey">
          {journey.map((item) => (
            <li key={item.title}>
              <span>{item.era}</span>
              <div>
                <strong>{item.title}</strong>
                <p className="muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>Doctors</h2>
        <p className="muted">These are the names that can appear at the bottom of a report.</p>
        <div className="grid-2 doctor-grid">
          {doctors.map((doctor) => (
            <article key={doctor.id} className="card doctor">
              <span className="avatar fill" aria-hidden="true">{initials(doctor.name)}</span>
              <div>
                <h2>{doctor.name}</h2>
                <p>{doctor.role}</p>
                <p className="muted">{doctor.cred}</p>
                <p>{doctor.focus}</p>
                <p className="kicker">{doctor.centre}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Equipment</h2>
        <p className="muted">What is on the floor at Ferry Road, and what travels on a home visit.</p>
        <div className="grid-3">
          {equipment.map((item) => (
            <Link key={item.name} to={item.to} className="card">
              <p className="kicker">{item.where}</p>
              <h2>{item.name}</h2>
              <p className="muted">{item.detail}</p>
            </Link>
          ))}
        </div>
      </section>
    </Page>
  )
}

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export function Doctors() {
  useTitle("Doctors")
  return (
    <Page>
      <p className="kicker">Who signs</p>
      <h1>The names at the bottom of the report.</h1>
      <div className="grid-2 section">
        {doctors.map((doctor) => (
          <article key={doctor.id} className="card">
            <h2>{doctor.name}</h2>
            <p>{doctor.role}</p>
            <p className="muted">{doctor.cred}</p>
            <p>{doctor.focus}</p>
            <p className="kicker">{doctor.centre}</p>
          </article>
        ))}
      </div>
    </Page>
  )
}

export function Contact() {
  useTitle("Contact")
  const [sent, setSent] = useState(false)
  return (
    <Page>
      <p className="kicker">Talk to the desk</p>
      <h1>Call {centrePhone}.</h1>
      <p className="lead">Reports, a changed slot, or a home collection in Yanam. 7:00 AM to 8:00 PM. D. No. 8-2-14, Ferry Road, Yanam 533464.</p>
      <form className="card" style={{ maxWidth: 560 }} onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
        {sent ? <p>Kept on this page only. Nothing was sent.</p> : (
          <>
            <Field label="Name"><input className="control" required /></Field>
            <Field label="Mobile"><input className="control" required /></Field>
            <Field label="About">
              <select className="control"><option>A report</option><option>Change a slot</option><option>A centre</option><option>A yearly plan</option></select>
            </Field>
            <Field label="Message"><textarea className="control" rows={4} required /></Field>
            <Button type="submit">Leave a note</Button>
          </>
        )}
      </form>
    </Page>
  )
}

export function Corporate() {
  useTitle("Workplace camps")
  const [sent, setSent] = useState(false)
  function submit(event: FormEvent) {
    event.preventDefault()
    setSent(true)
  }
  return (
    <Page>
      <p className="kicker">Workplaces</p>
      <h1>A camp that still gives each person a private report.</h1>
      <p className="lead">From 25 people. HR receives a summary without names, unless an employee opts in.</p>
      <div className="grid-3 section">
        {[
          ["Essential camp", "CBC, lipids, sugar, TSH", "From ₹899 / person"],
          ["Executive camp", "Executive Platinum plus an ECG", "From ₹4,200 / person"],
          ["Women’s camp", "Thyroid, vitamin D, iron", "From ₹1,499 / person"],
        ].map(([title, copy, price]) => (
          <article key={title} className="card"><h2>{title}</h2><p className="muted">{copy}</p><p>{price}</p></article>
        ))}
      </div>
      <form onSubmit={submit} className="card" style={{ maxWidth: 560, marginTop: 16 }}>
        {sent ? <p>Request noted on this page. Nobody was emailed.</p> : (
          <>
            <Field label="Company"><input className="control" required /></Field>
            <Field label="Headcount"><input className="control" required /></Field>
            <Field label="Phone"><input className="control" required /></Field>
            <Button type="submit">Ask for a camp</Button>
          </>
        )}
      </form>
    </Page>
  )
}

export function Prescription() {
  useTitle("Prescription")
  const { addTest } = useStore()
  const [file, setFile] = useState("")
  const suggestions = ["cbc", "dengue", "crp", "urine"].map((id) => tests.find((test) => test.id === id)).filter((test) => test !== undefined)
  return (
    <Page>
      <p className="kicker">Prescription</p>
      <h1>Photograph the slip. A person reads it.</h1>
      <p className="lead">This demo does not guess a panel from a photo. On a live desk, someone confirms the tests with you before a draw.</p>
      <label className="card" style={{ display: "block", maxWidth: 480, cursor: "pointer" }}>
        {file || "Choose a photo or PDF"}
        <input className="sr-only" type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0]?.name ?? "")} />
      </label>
      <p className="muted">The file stays on this device.</p>
      <h2>Often written on a fever slip</h2>
      {suggestions.map((test) => (
        <div key={test.id} className="line">
          <Link to={`/tests/${test.id}`}>{test.name}</Link>
          <span />
          <button type="button" className="solid" onClick={() => addTest(test.id)}>Add</button>
        </div>
      ))}
      <ButtonLink to="/book">Continue to a time</ButtonLink>
    </Page>
  )
}

export function Missing() {
  useTitle("Not found")
  return (
    <Page>
      <h1>That page is not on the desk.</h1>
      <ButtonLink to="/">Back home</ButtonLink>
    </Page>
  )
}
