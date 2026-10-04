export type Category = "Pathology" | "Radiology" | "Cardiology" | "Molecular"

export type Test = {
  id: string
  code: string
  name: string
  category: Category
  department: string
  sample: string
  tat: string
  price: number
  mrp: number
  fasting: boolean
  popular?: boolean
  home: boolean
  prep: string
  about: string
  params: string[]
}

export type Package = {
  id: string
  name: string
  audience: string
  price: number
  mrp: number
  fasting: boolean
  tat: string
  badge?: string
  summary: string
  testIds: string[]
}

export type Centre = {
  id: string
  name: string
  city: string
  address: string
  hours: string
  phone: string
  services: string[]
  image: string
  note: string
}

export type Doctor = {
  id: string
  name: string
  role: string
  cred: string
  focus: string
  centre: string
  photo: string
}

export type Analyte = {
  group: string
  name: string
  value: string
  unit: string
  ref: string
  flag?: "H" | "L"
}

export type OrderStatus =
  | "Booked"
  | "Collected"
  | "Accessioned"
  | "Processing"
  | "Review"
  | "Released"

export type Gender = "Female" | "Male" | "Other"
export type PayMode = "UPI" | "Card" | "Pay at centre"
export type VisitMode = "Centre visit" | "Home collection"

export type Order = {
  id: string
  patient: string
  phone: string
  age: number
  gender: Gender
  slot: string
  centre: string
  mode: VisitMode
  address?: string
  items: { name: string; price: number }[]
  testIds: string[]
  total: number
  pay: PayMode
  paid: boolean
  status: OrderStatus
  department: string
  priority: "Routine" | "Urgent"
  results: Analyte[]
  note: string
  authorisedBy?: string
}

export type CartItem = {
  key: string
  kind: "test" | "package"
  id: string
  name: string
  price: number
  testIds: string[]
}

export type Patient = {
  mrn: string
  name: string
  phone: string
  age: number
  gender: Gender
  city: string
}

export type Stock = {
  sku: string
  name: string
  lot: string
  expiry: string
  onHand: number
  reorderAt: number
  reorderQty: number
  onOrder: number
  unit: string
}

export type QcLot = {
  id: string
  name: string
  level: string
  instrument: string
  status: "In control" | "Warning"
  last: string
  runs: number
}

export type Rider = {
  id: string
  name: string
  zone: string
  stops: number
  status: "Assigned" | "En route" | "Collected" | "Dropped at lab"
  window: string
}

export type Staff = {
  name: string
  role: string
  centre: string
  shift: string
  state: "On floor" | "Off" | "Leave"
}

export type Referral = {
  name: string
  clinic: string
  city: string
  orders: number
  revenue: number
  payout: number
}

export const FLOW: OrderStatus[] = [
  "Booked",
  "Collected",
  "Accessioned",
  "Processing",
  "Review",
  "Released",
]

export function nextStatus(status: OrderStatus) {
  const index = FLOW.indexOf(status)
  return index < FLOW.length - 1 ? FLOW[index + 1] : null
}
