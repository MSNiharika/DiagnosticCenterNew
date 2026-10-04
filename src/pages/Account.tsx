import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import type { Account } from "../context/Store"
import { useStore } from "../context/Store"
import { seedOrders } from "../data/ops"
import { FLOW } from "../data/types"
import type { Gender, Order, OrderStatus } from "../data/types"
import { explainFlag } from "../data/voice"
import { digits, inr, phonePretty } from "../lib/utils"
import { Button, ButtonLink, Field, Page, useTitle } from "../components/ui"

function safeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback
  return value
}

export function Login() {
  useTitle("Sign in")
  const [params] = useSearchParams()
  const next = safeNext(params.get("next"), "/reports")
  const { session, signInPatient, signInStaff, signOut } = useStore()
  const navigate = useNavigate()
  return (
    <Page>
      <p className="kicker">Sign in</p>
      <h1>Patient, or lab desk.</h1>
      <p className="lead">A mobile number opens only that person’s reports. Staff id meera opens the lab desk. Try 9848012345 / aurora.</p>
      {session && (
        <div className="card" style={{ marginTop: 16 }}>
          Signed in as {session.name} · {session.role === "staff" ? "Staff" : "Patient"}
          <div className="actions">
            <Link to={session.role === "staff" ? "/console" : "/reports"}>Continue</Link>
            <button type="button" className="ghost" onClick={signOut}>Sign out</button>
          </div>
        </div>
      )}
      <div className="grid-2 section">
        <LoginCard
          title="Patient"
          copy="Reports and bookings for one mobile number."
          fields={[
            { name: "phone", label: "Mobile", placeholder: "9848012345" },
            { name: "password", label: "Password", placeholder: "aurora", secret: true },
          ]}
          onSubmit={(values) => {
            const error = signInPatient(values.phone ?? "", values.password ?? "")
            if (!error) navigate(next.startsWith("/console") ? "/reports" : next)
            return error
          }}
        />
        <LoginCard
          title="Lab desk"
          copy="Samples, results, billing, stock, and callbacks."
          fields={[
            { name: "id", label: "Staff id", placeholder: "meera" },
            { name: "password", label: "Password", placeholder: "aurora", secret: true },
          ]}
          onSubmit={(values) => {
            const error = signInStaff(values.id ?? "", values.password ?? "")
            if (!error) navigate("/console")
            return error
          }}
        />
      </div>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </Page>
  )
}

function LoginCard({
  title,
  copy,
  fields,
  onSubmit,
}: {
  title: string
  copy: string
  fields: { name: string; label: string; placeholder: string; secret?: boolean }[]
  onSubmit: (values: Record<string, string>) => string | null
}) {
  const [error, setError] = useState("")
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values = Object.fromEntries(fields.map((field) => [field.name, String(data.get(field.name) ?? "")]))
    setError(onSubmit(values) ?? "")
  }
  return (
    <form className="card" onSubmit={submit}>
      <h2>{title}</h2>
      <p className="muted">{copy}</p>
      {fields.map((field) => (
        <Field key={field.name} label={field.label}>
          <input className="control" name={field.name} placeholder={field.placeholder} type={field.secret ? "password" : "text"} required />
        </Field>
      ))}
      {error && <p className="err">{error}</p>}
      <Button type="submit">Sign in</Button>
    </form>
  )
}

const titles = ["Mr", "Mrs", "Ms", "Dr", "Master", "Baby"]

export function Register() {
  return <AccountForm mode="register" />
}
export function Profile() {
  return <AccountForm mode="profile" />
}

function AccountForm({ mode }: { mode: "register" | "profile" }) {
  useTitle(mode === "register" ? "Register" : "Profile")
  const { session, accountFor, register, updateProfile } = useStore()
  const navigate = useNavigate()
  const existing = session?.role === "patient" ? accountFor(session.phone) : null
  if (mode === "profile" && session?.role !== "patient") return <Navigate to="/login?next=/profile" replace />
  if (mode === "register" && session?.role === "patient") return <Navigate to="/reports" replace />
  return (
    <Page>
      <p className="kicker">{mode === "register" ? "New patient" : "Your account"}</p>
      <h1>{mode === "register" ? "Create an account." : "Your details."}</h1>
      <p className="lead">Reports open only for the mobile number on the account.</p>
      <Form
        key={existing?.phone ?? "new"}
        mode={mode}
        initial={existing}
        onSubmit={(account) => {
          const error = mode === "register" ? register(account) : updateProfile(account)
          if (!error && mode === "register") navigate("/reports")
          return error
        }}
      />
    </Page>
  )
}

function Form({
  mode,
  initial,
  onSubmit,
}: {
  mode: "register" | "profile"
  initial: Account | null
  onSubmit: (account: Account) => string | null
}) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [name, setName] = useState(initial?.name ?? "")
  const [dob, setDob] = useState(initial?.dob ?? "")
  const [gender, setGender] = useState<Gender | "">(initial?.gender ?? "")
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [altPhone, setAltPhone] = useState(initial?.altPhone ?? "")
  const [email, setEmail] = useState(initial?.email ?? "")
  const [password, setPassword] = useState(mode === "profile" ? (initial?.password ?? "") : "")
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title) return setError("Select a title.")
    if (name.trim().length < 2) return setError("Enter your name.")
    if (!dob || new Date(dob) > new Date()) return setError("Enter a date of birth that is not in the future.")
    if (!gender) return setError("Select a gender.")
    const mobile = digits(phone)
    if (mobile.length !== 10) return setError("Use a 10-digit mobile number.")
    const alternate = digits(altPhone)
    if (alternate && alternate.length !== 10) return setError("Alternate mobile needs 10 digits, or leave it blank.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email.")
    if (password.trim().length < 4) return setError("Password needs at least 4 characters.")
    const message = onSubmit({ title, name: name.trim(), dob, gender, phone: mobile, altPhone: alternate, email: email.trim(), password: password.trim() })
    setError(message ?? "")
    if (!message && mode === "profile") setSaved(true)
  }

  return (
    <form className="card" style={{ marginTop: 16, maxWidth: 640 }} onSubmit={submit}>
      <Field label="Title">
        <select className="control" value={title} onChange={(event) => setTitle(event.target.value)}>
          <option value="">Select</option>
          {titles.map((item) => <option key={item}>{item}</option>)}
        </select>
      </Field>
      <Field label="Name"><input className="control" value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <Field label="Date of birth"><input className="control" type="date" value={dob} onChange={(event) => setDob(event.target.value)} /></Field>
      <Field label="Gender">
        <select className="control" value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
          <option value="">Select</option>
          <option>Female</option>
          <option>Male</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label="Mobile"><input className="control" value={phone} readOnly={mode === "profile"} onChange={(event) => setPhone(event.target.value)} /></Field>
      <Field label="Alternate mobile"><input className="control" value={altPhone} onChange={(event) => setAltPhone(event.target.value)} /></Field>
      <Field label="Email"><input className="control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
      <Field label="Password"><input className="control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
      {error && <p className="err">{error}</p>}
      {saved && <p>Saved.</p>}
      <Button type="submit">{mode === "register" ? "Create account" : "Save"}</Button>
    </form>
  )
}

export function Reports() {
  useTitle("Reports")
  const [params] = useSearchParams()
  const { orders, session, accountFor } = useStore()
  const account = session?.role === "patient" ? accountFor(session.phone) : null
  const mine = session?.role === "patient" ? orders.filter((order) => order.phone === session.phone) : []
  const sample = session?.role === "patient" ? sampleReport(session.name, session.phone, account) : null
  const list = sample ? [...mine, sample] : mine
  const requested = params.get("order")?.trim().toUpperCase()
  const [picked, setPicked] = useState(requested && list.some((order) => order.id.toUpperCase() === requested) ? requested : list[0]?.id ?? "")
  const match = list.find((order) => order.id === picked) ?? list[0]

  if (session?.role !== "patient") {
    return (
      <Page>
        <p className="kicker">Reports</p>
        <h1>Sign in to see your reports.</h1>
        <p className="lead">A report opens only for the mobile number on the booking. The sample account is 9848012345 / aurora.</p>
        <div className="actions">
          <ButtonLink to="/login?next=/reports">Sign in</ButtonLink>
          <ButtonLink to="/register" variant="ghost">Register</ButtonLink>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <p className="kicker">Reports</p>
      <h1>Hello, {session.name.split(" ")[0]}.</h1>
      <p className="lead">Bookings on {phonePretty(session.phone)}. Numbers stay hidden until a doctor releases the report. The sample letter is there so you can see a finished one.</p>
      <div className="chips" style={{ marginTop: 12 }}>
        {list.map((order) => (
          <button key={order.id} type="button" className={`chip ${match?.id === order.id ? "on" : ""}`} onClick={() => setPicked(order.id)}>
            {order.id === "AR-SAMPLE" ? "Sample report" : order.id} · {order.status}
          </button>
        ))}
      </div>
      {match && <ReportBody order={match} />}
    </Page>
  )
}

function ReportBody({ order }: { order: Order }) {
  const [stage, setStage] = useState<OrderStatus>(order.status)
  useEffect(() => {
    setStage(order.status)
  }, [order.id, order.status])

  return (
    <article className="card" style={{ marginTop: 18 }}>
      <p className="kicker">{order.id}</p>
      <h2>{order.patient}</h2>
      <p className="muted">{order.age} · {order.gender} · {phonePretty(order.phone)} · {order.centre} · {order.slot} · {order.mode}</p>
      <div className="chips" style={{ marginTop: 10 }}>
        {FLOW.map((status) => (
          <button
            key={status}
            type="button"
            className={`chip ${FLOW.indexOf(status) <= FLOW.indexOf(order.status) ? "on" : ""} ${stage === status ? "viewing" : ""}`}
            aria-pressed={stage === status}
            onClick={() => setStage(status)}
          >
            {status}
          </button>
        ))}
      </div>
      <p>{inr(order.total)} · {order.items.map((item) => item.name).join(", ")}</p>
      <StageSample order={order} stage={stage} />
    </article>
  )
}

function StageSample({ order, stage }: { order: Order; stage: OrderStatus }) {
  const names = order.items.map((item) => item.name).join(", ")
  if (stage === "Booked") {
    return (
      <div className="stage-sample">
        <h2>Sample booking slip</h2>
        <p>This is the slip from the moment the visit was booked. No blood has been drawn, so there is nothing to read.</p>
        <p>{order.slot} · {order.mode}{order.address ? ` · ${order.address}` : ""}</p>
        <p>{names}</p>
        <p className="muted">{order.paid ? "Paid" : "Pay at the centre"} · {order.priority}</p>
      </div>
    )
  }
  if (stage === "Collected") {
    return (
      <div className="stage-sample">
        <h2>Sample collection note</h2>
        <p>The tubes are labelled {order.id} and still with the collector. The analyser has not seen them.</p>
        <ul>
          {order.items.map((item) => <li key={item.name}>{item.name} — in the bag</li>)}
        </ul>
        {order.address && <p className="muted">Drawn at {order.address}.</p>}
      </div>
    )
  }
  if (stage === "Accessioned") {
    return (
      <div className="stage-sample">
        <h2>Sample accession sheet</h2>
        <p>{order.id} is on the rack in {order.department}. Work has not started, so every line is still blank.</p>
        <ul>
          {order.items.map((item) => <li key={item.name}>{item.name} — on the rack</li>)}
        </ul>
        {order.note && <p className="muted">Bench note: {order.note}</p>}
      </div>
    )
  }
  if (stage === "Processing") {
    const firstGroup = order.results[0]?.group
    return (
      <div className="stage-sample">
        <h2>Sample worksheet</h2>
        <p>The first panel has numbers. The rest are still running. A doctor has not seen this page.</p>
        <ResultTable order={order} running={(row) => row.group !== firstGroup || !row.value} />
      </div>
    )
  }
  if (stage === "Review") {
    const flags = order.results.filter((row) => row.flag && row.value)
    return (
      <div className="stage-sample">
        <h2>Sample review copy</h2>
        <p>Every value is typed. {order.authorisedBy ?? "The duty doctor"} has not signed, so this is not a report you can keep.</p>
        {order.results.filter((row) => row.value).map((row) => (
          <p key={row.name}>{explainFlag(row.name, row.flag)}</p>
        ))}
        <p className="muted">{flags.length === 0 ? "Nothing on this sheet sits outside the reference range." : `${flags.length} value${flags.length === 1 ? "" : "s"} sit outside the range. They stay in the lab until the signature.`}</p>
        <ResultTable order={order} running={(row) => !row.value} />
        <p>Unsigned. Waiting for a signature.</p>
      </div>
    )
  }
  const flags = order.results.filter((row) => row.flag && row.value)
  return (
    <div className="stage-sample">
      <h2>Signed report</h2>
      {order.results.filter((row) => row.value).map((row) => (
        <p key={row.name}>{explainFlag(row.name, row.flag)}</p>
      ))}
      <p className="muted">{flags.length === 0 ? "Nothing sits outside the reference range." : `${flags.length} value${flags.length === 1 ? "" : "s"} sit outside the range.`}</p>
      <ResultTable order={order} running={() => false} />
      {order.note && <p>Note: {order.note}</p>}
      <p>Signed by {order.authorisedBy ?? "the duty doctor"}.</p>
    </div>
  )
}

function ResultTable({ order, running }: { order: Order; running: (row: Order["results"][number]) => boolean }) {
  return (
    <table>
      <thead><tr><th>Result</th><th>Value</th><th>Reference</th></tr></thead>
      <tbody>
        {order.results.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{running(row) ? "Running" : `${row.value || "—"} ${row.unit !== "—" ? row.unit : ""} ${row.flag ?? ""}`.trim()}</td>
            <td>{row.ref}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function sampleReport(name: string, phone: string, account: { dob: string; gender: Order["gender"] } | null): Order {
  const base = seedOrders.find((order) => order.status === "Released") ?? seedOrders[0]
  return { ...base, id: "AR-SAMPLE", patient: name, phone, gender: account?.gender ?? base.gender, centre: "Yanam", mode: "Centre visit", address: undefined, note: "Sample values so you can read a finished report. Not your medical record." }
}
