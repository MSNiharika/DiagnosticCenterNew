export const modules = [
  {
    to: "/console",
    label: "Command centre",
    blurb: "Today's queue, money still due, and the samples that need a person.",
    icon: "layout",
  },
  {
    to: "/console/desk",
    label: "Front desk",
    blurb: "Register a walk-in, find a chart, and check someone in.",
    icon: "desk",
  },
  {
    to: "/console/samples",
    label: "Sample floor",
    blurb: "Move a tube from booked to accessioned without losing the barcode.",
    icon: "tubes",
  },
  {
    to: "/console/worklist",
    label: "Worklist",
    blurb: "Type results. Highs and lows flag themselves against the reference.",
    icon: "list",
  },
  {
    to: "/console/validate",
    label: "Validation",
    blurb: "The pathologist reads, notes, and releases. Only then does the patient see it.",
    icon: "badge",
  },
  {
    to: "/console/billing",
    label: "Billing",
    blurb: "Packages, dues, and a payment taken at the counter.",
    icon: "bill",
  },
  {
    to: "/console/inventory",
    label: "Inventory",
    blurb: "Tubes, reagents, and contrast. Low stock is hard to miss.",
    icon: "boxes",
  },
  {
    to: "/console/logistics",
    label: "Home collection",
    blurb: "Riders, zones, and the handoff back to the lab.",
    icon: "truck",
  },
  {
    to: "/console/referrals",
    label: "Referrals",
    blurb: "Clinics that send work, and the payout still open.",
    icon: "steth",
  },
  {
    to: "/console/quality",
    label: "Quality",
    blurb: "Morning controls before patient samples are trusted.",
    icon: "shield",
  },
  {
    to: "/console/people",
    label: "People",
    blurb: "Who is on the floor, on which shift, at which centre.",
    icon: "users",
  },
  {
    to: "/console/insights",
    label: "Insights",
    blurb: "A week of revenue, modality mix, and turnaround.",
    icon: "chart",
  },
] as const

export type ModuleIcon = (typeof modules)[number]["icon"]
