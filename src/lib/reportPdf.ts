import type { Analyte, Order, OrderStatus } from "../data/types"
import { inr, phonePretty } from "./utils"

const PAGE_W = 595.28
const PAGE_H = 841.89
const DEEP: Rgb = [0.055, 0.235, 0.263]
const INK: Rgb = [0.086, 0.188, 0.2]
const MUTED: Rgb = [0.306, 0.396, 0.408]
const GOLD: Rgb = [0.769, 0.635, 0.396]
const MIST: Rgb = [0.906, 0.949, 0.941]
const LINE: Rgb = [0.89, 0.918, 0.91]
const FLAG: Rgb = [0.722, 0.361, 0.22]
const WHITE: Rgb = [1, 1, 1]

type Rgb = [number, number, number]
type Font = "F1" | "F2"

const TITLES: Record<OrderStatus, string> = {
  Booked: "Sample booking slip",
  Collected: "Sample collection note",
  Accessioned: "Sample accession sheet",
  Processing: "Sample worksheet",
  Review: "Sample review copy",
  Released: "Signed laboratory report",
}

export function downloadReportPdf(order: Order, stage: OrderStatus) {
  const bytes = buildReportPdf(order, stage)
  const blob = new Blob([bytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Aurora-${order.id}-${stage}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function buildReportPdf(order: Order, stage: OrderStatus) {
  const doc = new Doc()
  doc.heading(TITLES[stage])
  doc.paragraph(order.id === "AR-SAMPLE" ? "Sample values for a finished visit. Not a medical record." : "Aurora Diagnostics, Ferry Road, Yanam.")
  doc.pair("Accession", order.id)
  doc.pair("Status", stage)
  doc.pair("Patient", order.patient)
  doc.pair("Age / sex", `${order.age} / ${order.gender}`)
  doc.pair("Mobile", phonePretty(order.phone))
  doc.pair("Visit", order.slot)
  doc.pair("Centre", order.centre)
  doc.pair("Mode", order.address ? `${order.mode}, ${order.address}` : order.mode)
  doc.pair("Tests", order.items.map((item) => item.name).join(", "))
  doc.pair("Amount", `${inr(order.total)} · ${order.paid ? "Paid" : "Pay at the centre"}`)
  doc.gap(6)
  writeStage(doc, order, stage)
  doc.gap(8)
  doc.paragraph("Show a signed report to the doctor who asked for the test. This file does not start treatment.")
  return doc.toBytes()
}

function writeStage(doc: Doc, order: Order, stage: OrderStatus) {
  const names = order.items.map((item) => item.name)
  if (stage === "Booked") {
    doc.paragraph("This is the slip from the moment the visit was booked. No blood has been drawn, so there is nothing to read.")
    names.forEach((name) => doc.paragraph(name))
    return
  }
  if (stage === "Collected") {
    doc.paragraph(`The tubes are labelled ${order.id} and still with the collector. The analyser has not seen them.`)
    names.forEach((name) => doc.paragraph(`${name} — in the bag`))
    return
  }
  if (stage === "Accessioned") {
    doc.paragraph(`${order.id} is on the rack in ${order.department}. Work has not started, so every line is still blank.`)
    names.forEach((name) => doc.paragraph(`${name} — on the rack`))
    if (order.note) doc.paragraph(`Bench note: ${order.note}`)
    return
  }
  if (stage === "Processing") {
    const firstGroup = order.results[0]?.group
    doc.paragraph("The first panel has numbers. The rest are still running. A doctor has not seen this page.")
    writeTable(doc, order.results, (row) => row.group !== firstGroup || !row.value)
    return
  }
  if (stage === "Review") {
    doc.paragraph(`Every value is typed. ${order.authorisedBy ?? "The duty doctor"} has not signed, so this is not a report you can keep.`)
    writeFlags(doc, order)
    writeTable(doc, order.results, (row) => !row.value)
    doc.paragraph("Unsigned. Waiting for a signature.")
    return
  }
  writeFlags(doc, order)
  writeTable(doc, order.results, () => false)
  if (order.note) doc.paragraph(`Note: ${order.note}`)
  doc.paragraph(`Signed by ${order.authorisedBy ?? "the duty doctor"}.`)
}

function writeFlags(doc: Doc, order: Order) {
  const rows = order.results.filter((row) => row.value)
  const flags = rows.filter((row) => row.flag)
  if (flags.length === 0) {
    doc.paragraph("Nothing sits outside the reference range.")
    return
  }
  doc.paragraph(`${flags.length} value${flags.length === 1 ? "" : "s"} sit outside the range.`)
  flags.forEach((row) => {
    const where = row.flag === "H" ? "above" : "below"
    doc.paragraph(`${row.name} is ${where} the range printed here. Show it to your doctor.`)
  })
}

function writeTable(doc: Doc, rows: Analyte[], running: (row: Analyte) => boolean) {
  let group = ""
  doc.tableHead()
  rows.forEach((row) => {
    if (row.group !== group) {
      group = row.group
      doc.group(group)
    }
    const unit = row.unit && row.unit !== "—" ? ` ${row.unit}` : ""
    const value = running(row) ? "Running" : `${row.value || "—"}${unit}${row.flag ? ` ${row.flag}` : ""}`.trim()
    doc.result(row.name, value, row.ref, Boolean(row.flag) && !running(row))
  })
}

class Page {
  ops: string[] = []

  text(x: number, y: number, size: number, font: Font, text: string, color: Rgb) {
    const [r, g, b] = color
    this.ops.push(
      "BT",
      `${n(r)} ${n(g)} ${n(b)} rg`,
      `/${font} ${size} Tf`,
      `1 0 0 1 ${n(x)} ${n(y)} Tm`,
      `(${esc(text)}) Tj`,
      "ET",
    )
  }

  fill(x: number, y: number, w: number, h: number, color: Rgb) {
    const [r, g, b] = color
    this.ops.push(`${n(r)} ${n(g)} ${n(b)} rg`, `${n(x)} ${n(y)} ${n(w)} ${n(h)} re f`)
  }

  rule(x1: number, y: number, x2: number) {
    const [r, g, b] = LINE
    this.ops.push(`${n(r)} ${n(g)} ${n(b)} RG`, "0.6 w", `${n(x1)} ${n(y)} m`, `${n(x2)} ${n(y)} l`, "S")
  }
}

class Doc {
  private pages: Page[] = []
  private page = new Page()
  private y = 0

  constructor() {
    this.openPage()
  }

  heading(text: string) {
    this.need(26)
    this.page.text(48, this.y, 16, "F2", text, DEEP)
    this.y -= 24
  }

  paragraph(text: string) {
    wrap(text, 92).forEach((line) => {
      this.need(14)
      this.page.text(48, this.y, 10, "F1", line, INK)
      this.y -= 14
    })
    this.y -= 4
  }

  pair(label: string, value: string) {
    const lines = wrap(value, 62)
    this.need(14 * lines.length)
    this.page.text(48, this.y, 9, "F2", label, MUTED)
    lines.forEach((line, index) => {
      this.page.text(160, this.y - index * 13, 10, "F1", line, INK)
    })
    this.y -= 13 * lines.length + 2
  }

  gap(amount: number) {
    this.y -= amount
  }

  tableHead() {
    this.need(22)
    this.page.fill(48, this.y - 5, 499, 18, MIST)
    this.page.text(54, this.y, 8, "F2", "RESULT", MUTED)
    this.page.text(270, this.y, 8, "F2", "VALUE", MUTED)
    this.page.text(410, this.y, 8, "F2", "REFERENCE", MUTED)
    this.y -= 20
  }

  group(name: string) {
    this.need(16)
    this.page.text(54, this.y, 8, "F2", name.toUpperCase(), GOLD)
    this.y -= 14
  }

  result(name: string, value: string, ref: string, flagged: boolean) {
    this.need(16)
    this.page.text(54, this.y, 9, "F1", name, INK)
    this.page.text(270, this.y, 9, "F2", value, flagged ? FLAG : INK)
    this.page.text(410, this.y, 9, "F1", ref, MUTED)
    this.page.rule(48, this.y - 5, 547)
    this.y -= 16
  }

  toBytes() {
    this.pages.forEach((page, index) => {
      page.text(48, 34, 8, "F1", "Aurora Diagnostics  |  Ferry Road, Yanam  |  Sample report", MUTED)
      page.text(500, 34, 8, "F1", `${index + 1} / ${this.pages.length}`, MUTED)
    })
    return serialize(this.pages.map((page) => page.ops.join("\n")))
  }

  private need(height: number) {
    if (this.y - height < 56) this.openPage()
  }

  private openPage() {
    this.page = new Page()
    this.pages.push(this.page)
    this.page.fill(0, 782, PAGE_W, 60, DEEP)
    this.page.fill(0, 778, PAGE_W, 4, GOLD)
    this.page.text(48, 812, 13, "F2", "AURORA DIAGNOSTICS", WHITE)
    this.page.text(48, 796, 9, "F1", "Ferry Road, Yanam  |  0884 232 4500", WHITE)
    this.y = 754
  }
}

function wrap(text: string, maxChars: number) {
  const clean = latin(text)
  const words = clean.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : [""]
}

function latin(text: string) {
  return text
    .replace(/₹/g, "Rs. ")
    .replace(/\u00b7/g, " | ")
    .replace(/[\u2014\u2013]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00b5/g, "u")
    .replace(/\u00b3/g, "^3")
    .replace(/[^\x20-\x7E\n]/g, "")
}

function esc(text: string) {
  return latin(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function n(value: number) {
  return value.toFixed(2)
}

function serialize(streams: string[]) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${streams.map((_, index) => `${5 + index * 2} 0 R`).join(" ")}] /Count ${streams.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ]
  streams.forEach((stream, index) => {
    const pageObject = 5 + index * 2
    const contentObject = pageObject + 1
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(PAGE_W)} ${n(PAGE_H)}] /Contents ${contentObject} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`,
    )
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  })

  let body = "%PDF-1.4\n"
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(body.length)
    body += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefAt = body.length
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let index = 1; index < offsets.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`
  return new TextEncoder().encode(body + xref + trailer)
}
