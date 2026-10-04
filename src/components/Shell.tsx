import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useStore } from "../context/Store"
import { centrePhone, centrePhoneTel } from "../data/network"
import { accountSections } from "./AccountPanel"
import { HelpPopup } from "./Help"
import { SearchModal } from "./SearchModal"
import { SignIn } from "./SignIn"
import { inr } from "../lib/utils"

const primary = [
  ["/tests", "Blood tests"],
  ["/packages", "Checkups"],
  ["/collection", "Home visit"],
  ["/centres", "Centres"],
]

const lab = [
  ["/console", "Today"],
  ["/console/desk", "Front desk"],
  ["/console/samples", "Samples"],
  ["/console/worklist", "Type results"],
  ["/console/validate", "Sign reports"],
  ["/console/billing", "Billing"],
  ["/console/inventory", "Stock"],
  ["/console/logistics", "Home visits"],
  ["/console/referrals", "Referrals"],
  ["/console/quality", "Quality checks"],
  ["/console/people", "Staff"],
  ["/console/insights", "This week"],
  ["/console/callbacks", "Callbacks"],
]

export function Shell() {
  const { toast, cart, cartTotal, removeItem, session, signOut } = useStore()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [help, setHelp] = useState(false)
  const [auth, setAuth] = useState(false)
  const [finder, setFinder] = useState("")
  const [finderOpen, setFinderOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const onLab = location.pathname.startsWith("/console")

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    function show() {
      setHelp(true)
    }
    function login() {
      setAuth(true)
    }
    function search(event: Event) {
      setFinder((event as CustomEvent<string>).detail ?? "")
      setFinderOpen(true)
    }
    window.addEventListener("lumen-help", show)
    window.addEventListener("lumen-login", login)
    window.addEventListener("lumen-search", search)
    return () => {
      window.removeEventListener("lumen-help", show)
      window.removeEventListener("lumen-login", login)
      window.removeEventListener("lumen-search", search)
    }
  }, [])

  useEffect(() => {
    if (!userMenu) return
    function onDown(event: MouseEvent) {
      if (!userRef.current?.contains(event.target as Node)) setUserMenu(false)
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [userMenu])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const seen = new WeakSet<Element>()
    const watch = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.classList.add("rise")
        function done(event: AnimationEvent) {
          if (event.target !== el) return
          el.classList.remove("rise")
          el.removeEventListener("animationend", done)
        }
        el.addEventListener("animationend", done)
        watch.unobserve(el)
      }
    }, { threshold: 0.16, rootMargin: "0px 0px -36px 0px" })

    const selector = "h1, h2, .pack, .test-card, .blog, .door, article.card, .profile"
    function arm(node: Element) {
      if (seen.has(node)) return
      if (node.matches("h1, h2") && node.closest(".pack, .test-card, .blog, .door, article.card, .profile")) return
      seen.add(node)
      if (node.matches(".pack, .test-card, .blog, .door, article.card, .profile") && node.parentElement) {
        const siblings = [...node.parentElement.children].filter((item) => item.matches(".pack, .test-card, .blog, .door, article.card, .profile"))
        const index = siblings.indexOf(node)
        if (index > 0) (node as HTMLElement).style.setProperty("--rise-delay", `${Math.min(index, 6) * 70}ms`)
      }
      watch.observe(node)
    }
    function scan(root: ParentNode) {
      if (root instanceof Element && root.matches(selector)) arm(root)
      root.querySelectorAll(selector).forEach(arm)
    }
    scan(document.body)
    const changes = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) scan(node)
        })
      }
    })
    changes.observe(document.body, { childList: true, subtree: true })
    return () => {
      watch.disconnect()
      changes.disconnect()
    }
  }, [])

  useEffect(() => {
    if (onLab || sessionStorage.getItem("lumen-help")) return
    const timer = window.setTimeout(() => setHelp(true), 700)
    return () => window.clearTimeout(timer)
  }, [onLab])

  function closeHelp() {
    sessionStorage.setItem("lumen-help", "1")
    setHelp(false)
  }

  return (
    <div className="shell">
      <header className="top">
        <div className="strip">
          <span>Home collection from 7:00 AM</span>
          <span aria-hidden="true">|</span>
          <span>Reports after a doctor signs</span>
        </div>
        <div className="mast">
          <NavLink to="/" className="brand" onClick={() => setMenu(false)}>
            <em>◆</em>AURORA
          </NavLink>
          <nav className="nav">
            {primary.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "on" : "")}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="tools">
            {onLab && (
              <select className="floor" aria-label="Lab desk" value={location.pathname} onChange={(event) => navigate(event.target.value)}>
                {lab.map(([to, label]) => (
                  <option key={to} value={to}>
                    {label}
                  </option>
                ))}
              </select>
            )}
            <button type="button" className="iconbtn" aria-label="Search tests" onClick={() => { setFinder(""); setFinderOpen(true) }}>
              <SearchIcon />
            </button>
            <a className="iconbtn" href={`tel:${centrePhoneTel}`} aria-label={`Call ${centrePhone}`}>
              <PhoneIcon />
            </a>
            <div className="login-wrap" ref={userRef}>
              <button
                type="button"
                className="login-pill"
                aria-expanded={session ? userMenu : undefined}
                onClick={() => (session ? setUserMenu((open) => !open) : setAuth(true))}
              >
                <UserIcon />
                {session ? session.name.split(" ")[0] : "Login"}
              </button>
              {session && userMenu && (
                <div className="user-menu">
                  <div className="user-menu-head">
                    <span className="avatar ghost-avatar" aria-hidden="true"><UserIcon /></span>
                    <strong>{session.name.split(" ")[0]}</strong>
                  </div>
                  {session.role === "staff" ? (
                    <NavLink to="/console" onClick={() => setUserMenu(false)}>Lab desk</NavLink>
                  ) : (
                    accountSections.map((item) => (
                      <NavLink key={item} to={`/account?section=${encodeURIComponent(item)}`} onClick={() => setUserMenu(false)}>
                        <MenuGlyph name={item} />
                        {item}
                      </NavLink>
                    ))
                  )}
                  <button
                    type="button"
                    className="logout"
                    onClick={() => {
                      signOut()
                      setUserMenu(false)
                      navigate("/")
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button type="button" className="iconbtn" aria-label="Cart" onClick={() => setOpen(true)}>
              <BagIcon />
              {cart.length > 0 && <em>{cart.length}</em>}
            </button>
            <button type="button" className="iconbtn menu" aria-label="Menu" onClick={() => setMenu((value) => !value)}>
              <MenuIcon />
            </button>
          </div>
        </div>
        {menu && (
          <nav className="nav-drop">
            {primary.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={() => setMenu(false)}>
                {label}
              </NavLink>
            ))}
            <NavLink to="/reports" onClick={() => setMenu(false)}>
              Reports
            </NavLink>
          </nav>
        )}
      </header>
      <div className={`canvas wash-${washFor(location.pathname)}`}>
        <Outlet />
      </div>
      <footer className="foot">
        <div className="foot-grid">
          <div>
            <strong>Aurora Diagnostics</strong>
            <p>Ferry Road, Yanam. Blood tests, ultrasound, X-ray, and ECG.</p>
            <p>{centrePhone}</p>
          </div>
          <div>
            <strong>Book</strong>
            <NavLink to="/tests">Blood tests</NavLink>
            <NavLink to="/imaging">Scans</NavLink>
            <NavLink to="/packages">Checkups</NavLink>
            <NavLink to="/collection">Home visit</NavLink>
            <NavLink to="/prescription">Prescription</NavLink>
          </div>
          <div>
            <strong>For you</strong>
            <NavLink to="/guide">Help me choose</NavLink>
            <NavLink to="/compare">Compare prices</NavLink>
            <NavLink to="/family">Family</NavLink>
            <NavLink to="/plans">Yearly plans</NavLink>
            <NavLink to="/prep">How to prepare</NavLink>
            <NavLink to="/reports">Reports</NavLink>
          </div>
          <div>
            <strong>The centre</strong>
            <NavLink to="/centres">Centres</NavLink>
            <NavLink to="/doctors">Doctors</NavLink>
            <NavLink to="/about">About us</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/corporate">Corporate</NavLink>
            <NavLink to="/console">Lab desk</NavLink>
          </div>
        </div>
        <div className="legal">Aurora Diagnostics · Yanam · Offer code AURORA20</div>
      </footer>
      <SearchModal open={finderOpen} query={finder} onClose={() => setFinderOpen(false)} />
      <HelpPopup open={help && !onLab && !auth && !finderOpen} onClose={closeHelp} />
      <SignIn
        open={auth}
        onClose={() => setAuth(false)}
        onSignedIn={() => {
          setAuth(false)
          navigate("/account")
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
      />
      {toast && <div className="toast">{toast}</div>}
      {open && (
        <div className="drawer-back" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <aside className="drawer">
            <p className="kicker">Your basket</p>
            <h2 style={{ marginTop: 8 }}>{cart.length ? "Ready to pick a time" : "Nothing added yet"}</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {cart.map((item) => (
                <li key={item.key} className="line">
                  <span>
                    {item.name}
                    <span className="muted" style={{ display: "block", fontSize: "0.85rem" }}>
                      {item.kind === "package" ? `${item.testIds.length} tests` : "Single test"}
                    </span>
                  </span>
                  <span>{inr(item.price)}</span>
                  <button type="button" className="ghost" onClick={() => removeItem(item.key)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <p>Total {inr(cartTotal)}</p>
            <NavLink to="/book" className="solid" onClick={() => setOpen(false)}>
              Choose a time
            </NavLink>
          </aside>
        </div>
      )}
    </div>
  )
}

function washFor(path: string) {
  if (path.startsWith("/tests/") || path.startsWith("/packages/")) return "detail"
  if (path === "/") return "home"
  if (path.startsWith("/tests")) return "tests"
  if (path.startsWith("/imaging")) return "scans"
  if (path.startsWith("/packages")) return "packages"
  if (path.startsWith("/news")) return "news"
  if (path.startsWith("/book")) return "book"
  if (path.startsWith("/collection")) return "visit"
  if (path.startsWith("/centres")) return "centres"
  if (path.startsWith("/account") || path.startsWith("/profile") || path.startsWith("/reports") || path.startsWith("/login") || path.startsWith("/register")) return "account"
  if (path.startsWith("/console")) return "lab"
  if (path.startsWith("/guide")) return "guide"
  if (path.startsWith("/compare")) return "compare"
  if (path.startsWith("/family")) return "family"
  if (path.startsWith("/plans")) return "plans"
  if (path.startsWith("/prep")) return "prep"
  if (path.startsWith("/about")) return "about"
  if (path.startsWith("/doctors")) return "doctors"
  if (path.startsWith("/contact")) return "contact"
  if (path.startsWith("/corporate")) return "corporate"
  if (path.startsWith("/prescription")) return "prescription"
  return "paper"
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5L20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 4.5h2.2l1.2 3-1.6 1a12 12 0 0 0 5.7 5.7l1-1.6 3 1.2V16a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 6 7.7 2 2 0 0 1 8 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 19.2c1.4-2.6 3.7-3.7 6.5-3.7s5.1 1.1 6.5 3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 8h11l-.8 11h-9.4L6.5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function MenuGlyph({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const }
  if (name === "Profile") {
    return <svg {...common}><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M6 19c1.2-2.4 3.2-3.5 6-3.5s4.8 1.1 6 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  }
  if (name === "Booking") {
    return <svg {...common}><rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  }
  if (name === "Sample Tracking") {
    return <svg {...common}><path d="M5 6h10l4 5-4 5H5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
  }
  if (name === "Report") {
    return <svg {...common}><path d="M7 4h7l4 4v12H7z" stroke="currentColor" strokeWidth="1.6" /><path d="M14 4v4h4" stroke="currentColor" strokeWidth="1.6" /></svg>
  }
  if (name === "Family Members") {
    return <svg {...common}><circle cx="9" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" /><circle cx="16" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 18c.8-2 2.4-3 4.5-3s3.7 1 4.5 3M14 15.2c1.2-.4 2.4-.2 3.5.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  }
  return <svg {...common}><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.6" /></svg>
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
