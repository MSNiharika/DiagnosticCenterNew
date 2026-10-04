import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useFamily } from "../context/Family"
import type { Member } from "../context/Family"
import { useStore } from "../context/Store"
import { FLOW } from "../data/types"
import type { Gender } from "../data/types"
import { inr, phonePretty } from "../lib/utils"
import { useTitle } from "./ui"

export const accountSections = ["Profile", "Booking", "Sample Tracking", "Report", "Family Members", "Address"] as const
type Tab = (typeof accountSections)[number]

function sectionOf(value: string | null): Tab {
  return accountSections.find((item) => item === value) ?? "Profile"
}

export function AccountPanel() {
  const { session, accountFor, orders, signOut } = useStore()
  const { members } = useFamily()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = sectionOf(params.get("section"))
  useTitle(session?.role === "staff" ? "Lab desk" : session ? tab : "Sign in")
  if (!session) {
    return (
      <section className="desk">
        <div className="desk-panel">
          <h2>Sign in</h2>
          <p className="muted">Your profile, bookings, and reports open after a mobile code.</p>
          <button type="button" className="solid" onClick={() => window.dispatchEvent(new Event("lumen-login"))}>Login</button>
        </div>
      </section>
    )
  }
  const mine = session.role === "patient" ? orders.filter((order) => order.phone === session.phone) : []
  const account = session.role === "patient" ? accountFor(session.phone) : null
  const initial = session.name.trim().charAt(0).toUpperCase() || "A"

  const title = session.role === "staff" ? "Lab desk" : tab

  function choose(item: Tab) {
    setParams({ section: item })
  }

  return (
    <>
    <section className="desk" aria-label="Your account">
      <aside className="desk-side">
        <div className="account-user">
          <span className="avatar">{initial}</span>
          <span>
            <strong>{session.name.split(" ")[0]}</strong>
            <small>{session.role === "patient" ? phonePretty(session.phone) : "Lab desk"}</small>
          </span>
        </div>
        <nav className="desk-menu">
          {session.role === "staff" ? (
            <Link className="account-row on" to="/console">Lab desk <span aria-hidden="true">›</span></Link>
          ) : (
            accountSections.map((item) => (
              <button key={item} type="button" className={`account-row ${tab === item ? "on" : ""}`} onClick={() => choose(item)}>
                {item}
                <span aria-hidden="true">›</span>
              </button>
            ))
          )}
          <button
            type="button"
            className="account-row"
            onClick={() => {
              signOut()
              navigate("/")
            }}
          >
            Sign out
          </button>
        </nav>
      </aside>
      <div className="desk-panel">
        {session.role === "patient" && tab === "Address" ? (
          <AddressBook phone={session.phone} lines={mine.flatMap((order) => (order.address ? [order.address] : []))} />
        ) : session.role === "patient" && tab === "Family Members" ? (
          <FamilyList members={members} phone={session.phone} />
        ) : (
          <>
            <h2>{title}</h2>
            <div className="desk-body">
              {session.role === "staff" ? (
                <>
                  <p className="muted">You are signed in as staff. The patient menu is for a mobile number.</p>
                  <Link className="solid" to="/console">Open today</Link>
                </>
              ) : tab === "Profile" && account ? (
                <ProfileView />
              ) : tab === "Booking" ? (
                <BookingList empty={mine.length === 0} rows={mine} />
              ) : tab === "Sample Tracking" ? (
                <Tracking rows={mine} />
              ) : tab === "Report" ? (
                <Reports rows={mine.filter((order) => order.status === "Released")} />
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
    <section className="about-strip">
      <h2>About us</h2>
      <p>
        Aurora Diagnostics is the Ferry Road centre in Yanam. Blood tests, ultrasound, X-ray, and ECG share one building, and a report leaves only after a doctor signs it. Home collection covers Yanam town from 7:00 AM.
      </p>
    </section>
    </>
  )
}

function ProfileView() {
  const { session, accountFor, updateProfile } = useStore()
  const account = session?.role === "patient" ? accountFor(session.phone) : null
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(account?.name ?? "")
  const [gender, setGender] = useState<Gender | "">(account?.gender ?? "")
  const [dob, setDob] = useState(account?.dob ?? "")
  const [error, setError] = useState("")
  if (!account || session?.role !== "patient") return null
  const initial = account.name.trim().charAt(0).toUpperCase()

  function save() {
    if (!account || !gender) return setError("Select a gender.")
    if (name.trim().length < 2) return setError("Enter your name.")
    if (!dob) return setError("Enter a date of birth.")
    const message = updateProfile({
      title: account.title,
      name: name.trim(),
      dob,
      gender,
      phone: account.phone,
      altPhone: account.altPhone,
      email: account.email,
      password: account.password,
    })
    setError(message ?? "")
    if (!message) setEditing(false)
  }

  return (
    <>
      <div className="who">
        <span className="avatar">{initial}</span>
        <span>
          <strong>{account.name}</strong>
          <small>{phonePretty(session.phone)}</small>
        </span>
        <button type="button" className="ghost" onClick={() => setEditing((value) => !value)}>{editing ? "Close" : "Edit"}</button>
      </div>
      {editing ? (
        <div className="detail-grid">
          <label>Full name<input className="control" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Gender
            <select className="control" value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </label>
          <label>Date of birth<input className="control" type="date" value={dob} onChange={(event) => setDob(event.target.value)} /></label>
          {error && <p className="err">{error}</p>}
          <button type="button" className="solid" onClick={save}>Save</button>
        </div>
      ) : (
        <>
          <p className="kicker">Personal details</p>
          <div className="detail-grid">
            <p><span>Full name</span><strong>{account.name}</strong></p>
            <p><span>Phone number</span><strong>{phonePretty(session.phone)}</strong></p>
            <p><span>Gender</span><strong>{account.gender}</strong></p>
            <p><span>Date of birth</span><strong>{account.dob}</strong></p>
          </div>
        </>
      )}
    </>
  )
}

function BookingList({ empty, rows }: { empty: boolean; rows: ReturnType<typeof useStore>["orders"] }) {
  return (
    <>
      {empty ? (
        <div className="empty">
          <strong>No bookings yet</strong>
          <p>You don’t have any bookings at the moment.</p>
        </div>
      ) : (
        rows.map((order) => (
          <article key={order.id} className="book-row">
            <div>
              <strong>{order.id}</strong>
              <p className="muted">{order.items.map((item) => item.name).join(", ")}</p>
              <p className="muted">{order.slot} · {order.centre} · {order.mode}</p>
            </div>
            <div>
              <span className="pill">{order.status}</span>
              <p>{inr(order.total)}</p>
            </div>
          </article>
        ))
      )}
    </>
  )
}

function Tracking({ rows }: { rows: ReturnType<typeof useStore>["orders"] }) {
  return (
    <>
      {rows.length === 0 ? (
        <div className="empty"><strong>Nothing to track</strong><p>A booking will show each step from collection to a signed report.</p></div>
      ) : (
        rows.map((order) => (
          <article key={order.id} className="book-row">
            <div>
              <strong>{order.id}</strong>
              <p className="muted">{order.mode}{order.address ? ` · ${order.address}` : ""}</p>
              <div className="track">
                {FLOW.map((status) => (
                  <span key={status} className={FLOW.indexOf(status) <= FLOW.indexOf(order.status) ? "on" : ""}>{status}</span>
                ))}
              </div>
            </div>
          </article>
        ))
      )}
    </>
  )
}

function Reports({ rows }: { rows: ReturnType<typeof useStore>["orders"] }) {
  return (
    <>
      {rows.length === 0 ? (
        <div className="empty"><strong>No signed reports</strong><p>A report appears here after a doctor signs it.</p></div>
      ) : (
        rows.map((order) => (
          <article key={order.id} className="book-row">
            <div>
              <strong>{order.id}</strong>
              <p className="muted">{order.items.map((item) => item.name).join(", ")}</p>
            </div>
            <Link to="/reports">Open</Link>
          </article>
        ))
      )}
    </>
  )
}

const relations = ["Parent", "Partner", "Child", "Sibling", "Other"]

function FamilyList({ members, phone }: { members: Member[]; phone: string }) {
  const { add, update, remove } = useFamily()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [first, setFirst] = useState("")
  const [last, setLast] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState<Gender | "">("")
  const [relation, setRelation] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  function close() {
    setOpen(false)
    setEditing(null)
    setError("")
  }

  function beginAdd() {
    setEditing(null)
    setFirst("")
    setLast("")
    setDob("")
    setGender("")
    setRelation("")
    setError("")
    setOpen(true)
  }

  function beginEdit(member: Member) {
    const parts = member.name.trim().split(" ")
    setEditing(member.id)
    setFirst(parts[0] ?? "")
    setLast(parts.slice(1).join(" "))
    setDob(member.dob ?? "")
    setGender(member.gender)
    setRelation(member.relation)
    setError("")
    setOpen(true)
  }

  function save(event: FormEvent) {
    event.preventDefault()
    const age = ageFromDob(dob)
    if (first.trim().length < 2 || last.trim().length < 1) return setError("Enter the first and last name.")
    if (!dob || age < 0 || age > 110) return setError("Enter a date of birth.")
    if (!gender) return setError("Select a gender.")
    if (!relation) return setError("Select how they are related.")
    const next = { name: `${first.trim()} ${last.trim()}`, age: String(age), gender, relation, dob }
    if (editing) update(editing, next)
    else add(next)
    close()
  }

  return (
    <>
      <div className="panel-title">
        <h2>Family Members</h2>
        <button type="button" className="solid" onClick={beginAdd}>+ Add member</button>
      </div>
      {members.length === 0 ? (
        <div className="desk-body"><div className="empty"><strong>No family members yet</strong><p>Save a parent or a child, then book in their name.</p></div></div>
      ) : (
        members.map((member) => (
          <article key={member.id} className="saved-card">
            <div className="saved-top">
              <span className="avatar fill">{member.name.trim().charAt(0).toUpperCase() || "A"}</span>
              <div className="saved-id">
                <strong>{member.name}</strong>
                <span className="rel-pill">{member.relation}</span>
              </div>
              <button type="button" className="icon-act" aria-label={`Edit ${member.name}`} onClick={() => beginEdit(member)}><PencilIcon /></button>
              <button type="button" className="icon-act danger" aria-label={`Remove ${member.name}`} onClick={() => remove(member.id)}><TrashIcon /></button>
            </div>
            <div className="saved-facts">
              <p><span>Patient id</span><strong>{member.id}</strong></p>
              <p><span>Date of birth</span><strong>{member.dob ? prettyDate(member.dob) : "—"}</strong></p>
              <p><span>Gender</span><strong>{member.gender}</strong></p>
              <p><span>Phone</span><strong>{phonePretty(phone)}</strong></p>
            </div>
          </article>
        ))
      )}
      {open && (
        <div className="help-back" onMouseDown={(event) => event.target === event.currentTarget && close()}>
          <form className="member-modal" onSubmit={save}>
            <button type="button" className="help-x" onClick={close} aria-label="Close">×</button>
            <h2>{editing ? "Edit member" : "Add a member"}</h2>
            <label><span>First name <span className="req">*</span></span><input className="control" value={first} onChange={(event) => setFirst(event.target.value)} placeholder="Enter here" /></label>
            <label><span>Last name <span className="req">*</span></span><input className="control" value={last} onChange={(event) => setLast(event.target.value)} placeholder="Enter here" /></label>
            <label><span>Date of birth <span className="req">*</span></span><input className="control" type="date" value={dob} onChange={(event) => setDob(event.target.value)} /></label>
            <div className="member-split">
              <div>
                <p className="member-label"><span>Gender <span className="req">*</span></span></p>
                <div className="gender-pills">
                  {(["Male", "Female", "Other"] as const).map((item) => (
                    <button key={item} type="button" className={gender === item ? "on" : ""} onClick={() => setGender(item)}>{item}</button>
                  ))}
                </div>
              </div>
              <label>
                <span>Relation <span className="req">*</span></span>
                <select className="control" value={relation} onChange={(event) => setRelation(event.target.value)}>
                  <option value="">Select</option>
                  {relations.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
            {error && <p className="err">{error}</p>}
            <div className="actions member-save"><button type="submit" className="solid">Save</button></div>
          </form>
        </div>
      )}
    </>
  )
}

function prettyDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  if (!year || !month || !day || month < 1 || month > 12) return value
  return `${String(day).padStart(2, "0")} ${months[month - 1]} ${year}`
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12.5 7.5l4 4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M9 7V5h6v2M8 7l.8 12h6.4L16 7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function ageFromDob(dob: string) {
  const born = new Date(dob)
  if (Number.isNaN(born.getTime())) return -1
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const month = now.getMonth() - born.getMonth()
  if (month < 0 || (month === 0 && now.getDate() < born.getDate())) age -= 1
  return age
}

const addressLabels = ["Home", "Office", "Other"] as const
type AddressKind = (typeof addressLabels)[number]
type SavedAddress = { id: string; line: string; label?: string }
type AddressDraft = { id: string | null; line: string; kind: AddressKind; custom: string }

function draftFrom(row?: SavedAddress): AddressDraft {
  if (!row) return { id: null, line: "", kind: "Home", custom: "" }
  const label = row.label?.trim() || "Home"
  if (label === "Home" || label === "Office") return { id: row.id, line: row.line, kind: label, custom: "" }
  return { id: row.id, line: row.line, kind: "Other", custom: label === "Other" ? "" : label }
}

function labelOf(draft: AddressDraft) {
  return draft.kind === "Other" ? draft.custom.trim() || "Other" : draft.kind
}

function loadAddresses(): Record<string, SavedAddress[]> {
  try {
    const raw = localStorage.getItem("lumen-addresses")
    const parsed = raw ? (JSON.parse(raw) as Record<string, SavedAddress[]>) : {}
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function seedAddresses(phone: string, lines: string[]): SavedAddress[] {
  const seen = new Set<string>()
  const rows: SavedAddress[] = []
  lines.forEach((line) => {
    const clean = line.trim()
    if (!clean || seen.has(clean)) return
    seen.add(clean)
    rows.push({ id: `AD-${phone.slice(-4)}-${rows.length + 1}`, line: clean, label: "Home" })
  })
  return rows
}

function AddressBook({ phone, lines }: { phone: string; lines: string[] }) {
  const [book, setBook] = useState<Record<string, SavedAddress[]>>(loadAddresses)
  const [draft, setDraft] = useState<AddressDraft | null>(null)
  const [error, setError] = useState("")
  const saved = book[phone]
  const rows = saved ?? seedAddresses(phone, lines)

  useEffect(() => {
    if (book[phone]) return
    const next = { ...book, [phone]: seedAddresses(phone, lines) }
    setBook(next)
    localStorage.setItem("lumen-addresses", JSON.stringify(next))
  }, [book, lines, phone])

  function write(nextRows: SavedAddress[]) {
    const next = { ...book, [phone]: nextRows }
    setBook(next)
    localStorage.setItem("lumen-addresses", JSON.stringify(next))
  }

  function save() {
    if (!draft) return
    const line = draft.line.trim()
    if (line.length < 8) {
      setError("Enter the full address, including the area.")
      return
    }
    if (draft.kind === "Other" && draft.custom.trim().length < 2) {
      setError("Name this address, such as Parents or Clinic.")
      return
    }
    const label = labelOf(draft)
    const nextRows = draft.id
      ? rows.map((row) => (row.id === draft.id ? { ...row, line, label } : row))
      : [{ id: `AD-${Date.now().toString().slice(-6)}`, line, label }, ...rows]
    write(nextRows)
    setDraft(null)
    setError("")
  }

  return (
    <>
      <div className="panel-title">
        <h2>Address</h2>
        <button
          type="button"
          className="solid"
          onClick={() => {
            setError("")
            setDraft(draftFrom())
          }}
        >
          + Add address
        </button>
      </div>
      {draft && (
        <form
          className="addr-form"
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <div>
            <p className="member-label">Label</p>
            <div className="gender-pills">
              {addressLabels.map((item) => (
                <button key={item} type="button" className={draft.kind === item ? "on" : ""} onClick={() => setDraft({ ...draft, kind: item })}>{item}</button>
              ))}
            </div>
            {draft.kind === "Other" && (
              <input className="control" style={{ marginTop: 8 }} value={draft.custom} onChange={(event) => setDraft({ ...draft, custom: event.target.value })} placeholder="Parents, clinic, or another name" />
            )}
          </div>
          <label>
            {draft.id ? "Edit address" : "New address"}
            <textarea className="control" rows={3} value={draft.line} onChange={(event) => setDraft({ ...draft, line: event.target.value })} placeholder="House number, street, area, Yanam" />
          </label>
          {error && <p className="err">{error}</p>}
          <div className="actions">
            <button type="submit" className="solid">Save</button>
            <button type="button" className="ghost" onClick={() => { setDraft(null); setError("") }}>Cancel</button>
          </div>
        </form>
      )}
      {rows.length === 0 ? (
        <div className="desk-body">
        <div className="empty">
          <span className="addr-pin" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          <strong>No address added yet</strong>
          <p className="muted">Add an address to book home visits easily.</p>
        </div>
        </div>
      ) : (
        rows.map((row) => (
          <article key={row.id} className="saved-card">
            <div className="saved-top">
              <span className="avatar fill" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </span>
              <div className="saved-id">
                <strong>{row.line}</strong>
                <span className="rel-pill">{row.label?.trim() || "Home"}</span>
              </div>
              <button
                type="button"
                className="icon-act"
                aria-label="Edit address"
                onClick={() => {
                  setError("")
                  setDraft(draftFrom(row))
                }}
              >
                <PencilIcon />
              </button>
              <button type="button" className="icon-act danger" aria-label="Remove address" onClick={() => write(rows.filter((item) => item.id !== row.id))}>
                <TrashIcon />
              </button>
            </div>
            <div className="saved-facts">
              <p><span>Address</span><strong>{row.line}</strong></p>
              <p><span>Used for</span><strong>Home collection</strong></p>
            </div>
          </article>
        ))
      )}
    </>
  )
}
