import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { analytesFor, packageById, testById } from "../data/catalog"
import { seedOrders, seedPatients, seedQc, seedRiders, seedStock } from "../data/ops"
import type {
  CartItem,
  Gender,
  Order,
  OrderStatus,
  Patient,
  PayMode,
  QcLot,
  Rider,
  Stock,
  VisitMode,
} from "../data/types"
import { nextStatus } from "../data/types"
import { digits, flagFor, loadStore } from "../lib/utils"

export type Session =
  | { role: "patient"; name: string; phone: string }
  | { role: "staff"; name: string }

export type Account = {
  title: string
  name: string
  dob: string
  gender: Gender
  phone: string
  altPhone: string
  email: string
  password: string
}

export const demoOtp = "4829"

const seedAccounts: Account[] = [
  {
    title: "Ms",
    name: "Meera Kapoor",
    dob: "1992-04-12",
    gender: "Female",
    phone: "9848012345",
    altPhone: "",
    email: "meera.kapoor@example.com",
    password: "aurora",
  },
]

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem("lumen-accounts")
    const parsed = raw ? (JSON.parse(raw) as Account[]) : []
    const list = Array.isArray(parsed) ? parsed : []
    const missing = seedAccounts.filter((seed) => !list.some((row) => row.phone === seed.phone))
    return [...missing, ...list]
  } catch {
    return seedAccounts
  }
}

type PlaceInput = {
  mode: VisitMode
  centre: string
  slot: string
  address?: string
  patient: { name: string; phone: string; age: number; gender: Gender }
  total: number
  pay: PayMode
}

type Store = {
  city: string
  setCity: (city: string) => void
  cart: CartItem[]
  addTest: (id: string) => void
  addPackage: (id: string) => void
  removeItem: (key: string) => void
  clearCart: () => void
  cartTotal: number
  orders: Order[]
  patients: Patient[]
  inventory: Stock[]
  qc: QcLot[]
  riders: Rider[]
  toast: string | null
  notify: (message: string) => void
  placeOrder: (input: PlaceInput) => Order
  advance: (id: string) => void
  setStatus: (id: string, status: OrderStatus) => void
  setPaid: (id: string) => void
  setPriority: (id: string) => void
  setResult: (id: string, index: number, value: string) => void
  setNote: (id: string, note: string) => void
  release: (id: string) => void
  addPatient: (patient: Omit<Patient, "mrn">) => void
  reorder: (sku: string) => void
  logQc: (id: string) => void
  advanceRider: (id: string) => void
  resetDemo: () => void
  session: Session | null
  accountFor: (phone: string) => Account | null
  register: (account: Account) => string | null
  updateProfile: (account: Account) => string | null
  signInPatient: (phone: string, password: string) => string | null
  signInWithOtp: (phone: string, code: string) => string | null
  signInStaff: (id: string, password: string) => string | null
  signOut: () => void
}

const Ctx = createContext<Store | null>(null)

const riderFlow: Rider["status"][] = ["Assigned", "En route", "Collected", "Dropped at lab"]

export function StoreProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState(() => {
    const saved = localStorage.getItem("lumen-city")
    if (saved === "Yanam") return saved
    localStorage.setItem("lumen-city", "Yanam")
    return "Yanam"
  })
  const [cart, setCart] = useState<CartItem[]>(() => loadStore("lumen-cart", []))
  const [orders, setOrders] = useState<Order[]>(() => loadStore("lumen-orders", seedOrders))
  const [patients, setPatients] = useState<Patient[]>(() => loadStore("lumen-patients", seedPatients))
  const [inventory, setInventory] = useState<Stock[]>(() => loadStore("lumen-stock", seedStock))
  const [qc, setQc] = useState<QcLot[]>(() => loadStore("lumen-qc", seedQc))
  const [riders, setRiders] = useState<Rider[]>(() => loadStore("lumen-riders", seedRiders))
  const [toast, setToast] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(() => loadStore("lumen-session", null))
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    sessionStorage.setItem("lumen-cart", JSON.stringify(cart))
  }, [cart])
  useEffect(() => {
    sessionStorage.setItem("lumen-orders", JSON.stringify(orders))
  }, [orders])
  useEffect(() => {
    sessionStorage.setItem("lumen-patients", JSON.stringify(patients))
  }, [patients])
  useEffect(() => {
    sessionStorage.setItem("lumen-stock", JSON.stringify(inventory))
  }, [inventory])
  useEffect(() => {
    sessionStorage.setItem("lumen-qc", JSON.stringify(qc))
  }, [qc])
  useEffect(() => {
    sessionStorage.setItem("lumen-riders", JSON.stringify(riders))
  }, [riders])
  useEffect(() => {
    sessionStorage.setItem("lumen-session", JSON.stringify(session))
  }, [session])
  useEffect(() => {
    localStorage.setItem("lumen-accounts", JSON.stringify(accounts))
  }, [accounts])

  const notify = useCallback((message: string) => {
    setToast(message)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const setCity = useCallback((next: string) => {
    setCityState(next)
    localStorage.setItem("lumen-city", next)
  }, [])

  const addTest = useCallback(
    (id: string) => {
      const test = testById(id)
      if (!test) return
      const key = `test:${id}`
      if (cart.some((item) => item.key === key)) {
        notify(`${test.name} is already in the booking`)
        return
      }
      setCart((items) => [...items, { key, kind: "test", id, name: test.name, price: test.price, testIds: [id] }])
      notify(`${test.name} added`)
    },
    [cart, notify],
  )

  const addPackage = useCallback(
    (id: string) => {
      const item = packageById(id)
      if (!item) return
      const key = `package:${id}`
      if (cart.some((entry) => entry.key === key)) {
        notify(`${item.name} is already in the booking`)
        return
      }
      setCart((items) => [
        ...items,
        { key, kind: "package", id, name: item.name, price: item.price, testIds: item.testIds },
      ])
      notify(`${item.name} added`)
    },
    [cart, notify],
  )

  const removeItem = useCallback((key: string) => {
    setCart((items) => items.filter((item) => item.key !== key))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart])

  const placeOrder = useCallback(
    (input: PlaceInput) => {
      const testIds = [...new Set(cart.flatMap((item) => item.testIds))]
      const departments = new Set(testIds.map((id) => testById(id)?.department).filter(Boolean))
      const order: Order = {
        id: `AR-${Date.now().toString().slice(-6)}`,
        patient: input.patient.name,
        phone: input.patient.phone,
        age: input.patient.age,
        gender: input.patient.gender,
        slot: input.slot,
        centre: input.centre,
        mode: input.mode,
        address: input.address,
        items: cart.map((item) => ({ name: item.name, price: item.price })),
        testIds,
        total: input.total,
        pay: input.pay,
        paid: input.pay !== "Pay at centre",
        status: "Booked",
        department: departments.size > 1 ? "Multi-department" : ([...departments][0] ?? "Front desk"),
        priority: "Routine",
        results: analytesFor(testIds),
        note: "",
      }
      setOrders((prev) => [order, ...prev])
      setPatients((prev) => {
        if (prev.some((person) => person.phone === input.patient.phone)) return prev
        return [
          {
            mrn: `AU-${10430 + prev.length}`,
            name: input.patient.name,
            phone: input.patient.phone,
            age: input.patient.age,
            gender: input.patient.gender,
            city,
          },
          ...prev,
        ]
      })
      setCart([])
      notify(`Booking ${order.id} is in the queue`)
      return order
    },
    [cart, city, notify],
  )

  const setStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
              authorisedBy: status === "Released" ? "Dr. Meera Iyer" : order.authorisedBy,
            }
          : order,
      ),
    )
  }, [])

  const advance = useCallback(
    (id: string) => {
      const order = orders.find((item) => item.id === id)
      if (!order) return
      const status = nextStatus(order.status)
      if (!status) return
      setStatus(id, status)
      notify(`${order.id} → ${status}`)
    },
    [notify, orders, setStatus],
  )

  const setPaid = useCallback(
    (id: string) => {
      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, paid: true } : order)))
      notify("Payment recorded")
    },
    [notify],
  )

  const setPriority = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, priority: order.priority === "Urgent" ? "Routine" : "Urgent" }
          : order,
      ),
    )
  }, [])

  const setResult = useCallback((id: string, index: number, value: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order
        const results = order.results.map((row, rowIndex) =>
          rowIndex === index ? { ...row, value, flag: flagFor(value, row.ref) } : row,
        )
        return { ...order, results }
      }),
    )
  }, [])

  const setNote = useCallback((id: string, note: string) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, note } : order)))
  }, [])

  const release = useCallback(
    (id: string) => {
      const order = orders.find((item) => item.id === id)
      if (!order) return
      if (order.results.length === 0 || order.results.some((row) => !row.value.trim())) {
        notify("Enter every result on the worklist before release")
        return
      }
      setStatus(id, "Released")
      notify(`${order.id} released to the patient`)
    },
    [notify, orders, setStatus],
  )

  const addPatient = useCallback(
    (patient: Omit<Patient, "mrn">) => {
      setPatients((prev) => [{ ...patient, mrn: `AU-${10430 + prev.length}` }, ...prev])
      notify(`${patient.name} registered`)
    },
    [notify],
  )

  const reorder = useCallback(
    (sku: string) => {
      setInventory((rows) =>
        rows.map((row) => (row.sku === sku ? { ...row, onOrder: row.onOrder + row.reorderQty } : row)),
      )
      notify("Purchase order queued")
    },
    [notify],
  )

  const logQc = useCallback(
    (id: string) => {
      const stamp = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
      setQc((rows) =>
        rows.map((row) =>
          row.id === id ? { ...row, last: stamp, runs: row.runs + 1, status: "In control" } : row,
        ),
      )
      notify("QC point logged")
    },
    [notify],
  )

  const advanceRider = useCallback(
    (id: string) => {
      setRiders((rows) =>
        rows.map((row) => {
          if (row.id !== id) return row
          const index = riderFlow.indexOf(row.status)
          const status = riderFlow[Math.min(riderFlow.length - 1, index + 1)]
          return { ...row, status }
        }),
      )
    },
    [],
  )

  const accountFor = useCallback(
    (phone: string) => accounts.find((row) => row.phone === digits(phone)) ?? null,
    [accounts],
  )

  const register = useCallback(
    (account: Account) => {
      const phone = digits(account.phone)
      if (phone.length !== 10) return "Use a 10-digit mobile number."
      if (accounts.some((row) => row.phone === phone)) return "This mobile is already registered. Sign in instead."
      const next = { ...account, phone, altPhone: digits(account.altPhone) }
      setAccounts((rows) => [...rows, next])
      setPatients((prev) => [
        { mrn: `AU-${10430 + prev.length}`, name: next.name, phone, age: ageFromDob(next.dob), gender: next.gender, city },
        ...prev,
      ])
      setSession({ role: "patient", name: next.name, phone })
      notify("Account created")
      return null
    },
    [accounts, city, notify],
  )

  const updateProfile = useCallback(
    (account: Account) => {
      if (session?.role !== "patient") return "Sign in to update your profile."
      const phone = session.phone
      if (!accounts.some((row) => row.phone === phone)) return "This account is not on file."
      const next = { ...account, phone, altPhone: digits(account.altPhone) }
      setAccounts((rows) => rows.map((row) => (row.phone === phone ? next : row)))
      setSession({ role: "patient", name: next.name, phone })
      notify("Profile updated")
      return null
    },
    [accounts, notify, session],
  )

  const signInPatient = useCallback(
    (phone: string, password: string) => {
      const mobile = digits(phone)
      if (mobile.length !== 10) return "Use a 10-digit mobile number."
      const account = accounts.find((row) => row.phone === mobile)
      if (!account) return "No registration for this mobile. Create an account first."
      if (password.trim().toLowerCase() !== account.password.trim().toLowerCase()) return "That password does not match this mobile."
      setSession({ role: "patient", name: account.name, phone: mobile })
      notify(`Signed in as ${account.name}`)
      return null
    },
    [accounts, notify],
  )

  const signInWithOtp = useCallback(
    (phone: string, code: string) => {
      const mobile = digits(phone)
      if (mobile.length !== 10) return "Use a 10-digit mobile number."
      const account = accounts.find((row) => row.phone === mobile)
      if (!account) return "No registration for this mobile. Create an account first."
      if (code !== demoOtp) return "That code does not match. The demo code is 4829."
      setSession({ role: "patient", name: account.name, phone: mobile })
      notify(`Signed in as ${account.name}`)
      return null
    },
    [accounts, notify],
  )

  const signInStaff = useCallback(
    (id: string, password: string) => {
      const handle = id.trim().toLowerCase()
      if (password.trim().toLowerCase() !== "aurora" || (handle !== "meera" && handle !== "staff")) {
        return "Staff id meera, password aurora."
      }
      setSession({ role: "staff", name: "Dr. Meera Iyer" })
      notify("Staff desk unlocked")
      return null
    },
    [notify],
  )

  const signOut = useCallback(() => {
    setSession(null)
    notify("Signed out")
  }, [notify])

  const resetDemo = useCallback(() => {
    setOrders(seedOrders)
    setPatients(seedPatients)
    setInventory(seedStock)
    setQc(seedQc)
    setRiders(seedRiders)
    setCart([])
    notify("Sample day restored")
  }, [notify])

  const value: Store = {
    city,
    setCity,
    cart,
    addTest,
    addPackage,
    removeItem,
    clearCart,
    cartTotal,
    orders,
    patients,
    inventory,
    qc,
    riders,
    toast,
    notify,
    placeOrder,
    advance,
    setStatus,
    setPaid,
    setPriority,
    setResult,
    setNote,
    release,
    addPatient,
    reorder,
    logQc,
    advanceRider,
    resetDemo,
    session,
    accountFor,
    register,
    updateProfile,
    signInPatient,
    signInWithOtp,
    signInStaff,
    signOut,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function ageFromDob(dob: string) {
  const born = new Date(dob)
  if (Number.isNaN(born.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const month = now.getMonth() - born.getMonth()
  if (month < 0 || (month === 0 && now.getDate() < born.getDate())) age -= 1
  return Math.max(0, age)
}

export function useStore() {
  const value = useContext(Ctx)
  if (!value) throw new Error("Store missing")
  return value
}
