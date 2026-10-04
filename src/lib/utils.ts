export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export function relevanceScore(parts: string[], query: string, popular = false) {
  const needle = query.trim().toLowerCase()
  if (!needle) return popular ? 2 : 0
  const name = parts[0]?.toLowerCase() ?? ""
  let score = 0
  if (name === needle) score += 120
  else if (name.startsWith(needle)) score += 70
  if (parts.some((part) => part.toLowerCase().includes(needle))) score += 36
  for (const word of needle.split(/\s+/).filter(Boolean)) {
    if (parts.some((part) => part.toLowerCase().includes(word))) score += 14
  }
  if (popular) score += 6
  return score
}

export function inr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function digits(value: string) {
  return value.replace(/\D/g, "")
}

export function phonePretty(value: string) {
  const d = digits(value)
  if (d.length !== 10) return value
  return `${d.slice(0, 5)} ${d.slice(5)}`
}

export const SLOT_TIMES = [
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:30 AM",
  "11:00 AM",
  "1:00 PM",
  "3:00 PM",
  "5:30 PM",
]

export function slotPassed(dayIndex: number, time: string) {
  if (dayIndex > 0) return false
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/)
  if (!match) return false
  let hours = Number(match[1]) % 12
  if (match[3] === "PM") hours += 12
  const minutes = Number(match[2])
  const now = new Date()
  return hours < now.getHours() || (hours === now.getHours() && minutes <= now.getMinutes())
}

export function upcomingDays(count = 5) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    if (index === 0) return "Today"
    if (index === 1) return "Tomorrow"
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  })
}

export function flagFor(value: string, ref: string): "H" | "L" | undefined {
  const reading = Number(value)
  if (!value.trim() || Number.isNaN(reading)) return undefined
  const lessThan = ref.match(/^<\s*([\d.]+)/)
  if (lessThan) return reading >= Number(lessThan[1]) ? "H" : undefined
  const greaterThan = ref.match(/^>\s*([\d.]+)/)
  if (greaterThan) return reading <= Number(greaterThan[1]) ? "L" : undefined
  const between = ref.match(/([\d.]+)\s*[–-]\s*([\d.]+)/)
  if (!between) return undefined
  if (reading < Number(between[1])) return "L"
  if (reading > Number(between[2])) return "H"
  return undefined
}

export function loadStore<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
