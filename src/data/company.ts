import { photos } from "./network"

export const networkStats = [
  { value: "2026", label: "Opened", note: "A new diagnostic centre on Ferry Road, Yanam" },
  { value: "1", label: "Lab", note: "Blood tests, ultrasound, X-ray, and ECG under one roof" },
  { value: "Yanam", label: "Home collection", note: "Town, Mettakuru, Dariyalatippa, and Farampeta" },
  { value: "6 hr", label: "Routine reports", note: "Blood counts and biochemistry, once the sample is in" },
  { value: "7 AM", label: "First slot", note: "Centre visits and home draws start at 7:00 AM" },
  { value: "533464", label: "Yanam", note: "Puducherry · D. No. 8-2-14, Ferry Road" },
]

export const journey = [
  {
    era: "2026",
    title: "The centre opens in Yanam",
    body: "Aurora Diagnostics opens on Ferry Road. Pathology, ultrasound, digital X-ray, and ECG share one building, and every report carries the duty doctor's name.",
  },
  {
    era: "Opening month",
    title: "Home collection across Yanam",
    body: "Phlebotomists cover Yanam town, Mettakuru, Dariyalatippa, and Farampeta from 7:00 AM, with a sealed kit and a temperature log.",
  },
  {
    era: "The lab",
    title: "Analysers before the first patient",
    body: "Chemistry, immunoassay, and haematology run morning controls before patient samples. A warm home tube is rejected and redrawn.",
  },
  {
    era: "Mettakuru",
    title: "A morning collection desk",
    body: "The Mettakuru desk takes drop-offs until 1:00 PM. Those samples are logged into the same queue as a Ferry Road walk-in.",
  },
]

export const equipment = [
  {
    name: "Chemistry and immunoassay",
    where: "Ferry Road lab",
    detail: "Thyroid, vitamins, hormones, and routine biochemistry. Morning controls run before the first patient sample.",
    image: photos.bench,
    to: "/tests",
  },
  {
    name: "Haematology analyser",
    where: "Ferry Road lab",
    detail: "Complete blood counts, with a smear review when the analyser asks for a film.",
    image: photos.vials,
    to: "/tests?q=Complete%20Blood",
  },
  {
    name: "Ultrasound",
    where: "Yanam centre",
    detail: "Abdomen and small-parts studies. Fasting, when the test needs it, is written on the booking page.",
    image: photos.mri,
    to: "/imaging",
  },
  {
    name: "Digital X-ray",
    where: "Yanam centre",
    detail: "Chest and bone X-rays, read before the report is released.",
    image: photos.xray,
    to: "/imaging",
  },
  {
    name: "ECG",
    where: "Yanam centre",
    detail: "Same-day tracing at the centre. A treadmill is not offered as a home visit.",
    image: photos.consult,
    to: "/tests/ecg",
  },
  {
    name: "Cold-chain transport",
    where: "Yanam home routes",
    detail: "Logged boxes between the door and Ferry Road. A warm tube is rejected and redrawn.",
    image: photos.bench,
    to: "/collection",
  },
]

export const qualityMarks = [
  {
    name: "NABL",
    body: "The new lab is opening against NABL scope rules: the tests on the menu are the tests this bench runs. Anything outside that list is marked referred.",
  },
  {
    name: "ISO 15189",
    body: "Sample identity, analyser checks, and who released the report sit on the record. The portal shows tracking until a doctor signs.",
  },
  {
    name: "Patient ID",
    body: "Name, phone, and accession number are checked at the desk and again at the draw, including home visits in Yanam.",
  },
]

export const awards = [
  {
    year: "2026",
    title: "Opened in Yanam",
    body: "A new diagnostic centre for the town: blood tests, ultrasound, X-ray, and ECG on Ferry Road.",
  },
  {
    year: "2026",
    title: "Home collection from week one",
    body: "Draws at the door across Yanam town, Mettakuru, Dariyalatippa, and Farampeta.",
  },
  {
    year: "2026",
    title: "Same-day routine reports",
    body: "Blood counts and biochemistry aimed inside six hours of the sample reaching the analyser.",
  },
  {
    year: "2026",
    title: "A doctor on the report",
    body: "The patient portal stays on tracking until the duty pathologist releases the result.",
  },
]
