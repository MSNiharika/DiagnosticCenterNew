export type Block = { kind: "p"; text: string } | { kind: "ul"; items: string[] }

export type Section = {
  id: string
  title: string
  blocks: Block[]
}

export type Post = {
  slug: string
  date: string
  tag: string
  title: string
  excerpt: string
  image: string
  intro: string[]
  sections: Section[]
  summary: string
  faqs: { q: string; a: string }[]
  book: { to: string; label: string }
}

export const posts: Post[] = [
  {
    slug: "fasting-before-a-lipid-test",
    date: "12 Sep 2026",
    tag: "Preparation",
    image: "/news/fasting.jpg",
    title: "Skip the morning tea before a lipid test",
    excerpt: "Cholesterol and triglycerides move after a meal. Water is fine. Tea, coffee, and breakfast are not.",
    book: { to: "/tests/lipid", label: "Book a lipid profile" },
    intro: [
      "A lipid profile is read next to blood pressure and sugar, not on its own. A meal in the last ten hours can lift triglycerides and make the result harder to use.",
      "At Ferry Road the request is simple: water is allowed, tea and breakfast are not, and if you already ate, tell the desk before the sample is drawn.",
    ],
    sections: [
      {
        id: "why-fasting",
        title: "Why a meal changes the number",
        blocks: [
          { kind: "p", text: "Triglycerides rise after food and fall again over the next several hours. Cholesterol moves less, but the panel is reported together, so one recent meal can make the whole set harder to compare with a later visit." },
          { kind: "p", text: "The Yanam menu asks for 10–12 hours without food before a lipid profile. That window is overnight for most people: dinner, then nothing but water until the morning draw." },
        ],
      },
      {
        id: "what-you-can-drink",
        title: "What you can drink",
        blocks: [
          { kind: "p", text: "Plain water is fine, and it helps the draw. These are the things that count as a meal for this test:" },
          {
            kind: "ul",
            items: [
              "Tea and coffee, including without milk or sugar",
              "Juice, milk, and soft drinks",
              "Breakfast, fruit, or a late snack",
              "Alcohol the evening before",
            ],
          },
          { kind: "p", text: "If you take a morning medicine with a sip of water, that sip is not the problem. The tea beside it is." },
        ],
      },
      {
        id: "medicines",
        title: "Medicines on the morning of the test",
        blocks: [
          { kind: "p", text: "Take medicines your doctor has not asked you to hold. Do not stop a statin, a blood-pressure tablet, or thyroid medicine because of a blood test unless that doctor has said so." },
          { kind: "p", text: "Tell the phlebotomist what you took and when. The note goes with the sample so the person signing the report can see it." },
        ],
      },
      {
        id: "already-ate",
        title: "If you already ate",
        blocks: [
          { kind: "p", text: "Say so at the desk or to the person at your door. We would rather move the slot than file a number that does not belong to a fasting sample." },
          { kind: "p", text: "A home collection can be shifted to the next morning. A walk-in at Ferry Road can be asked to come back. There is no charge for that conversation." },
        ],
      },
    ],
    summary: "For a lipid profile, finish dinner and then drink only water until the sample is taken. Keep your usual medicines unless a doctor has told you to hold them, and tell the desk if you have already eaten.",
    faqs: [
      { q: "How long should I fast?", a: "Ten to twelve hours. For a 7:00 AM slot, that means nothing but water after about 8:00 or 9:00 PM." },
      { q: "Can I drink black coffee?", a: "No. Coffee and tea, with or without milk, are treated as a meal for this test." },
      { q: "Does a home visit follow the same rule?", a: "Yes. The phlebotomist asks the same question at the door. If you have eaten, the visit can be moved." },
    ],
  },
  {
    slug: "what-a-signed-report-means",
    date: "28 Aug 2026",
    tag: "Reports",
    image: "/news/report.jpg",
    title: "A report is released after a doctor signs it",
    excerpt: "The analyser prints a number. A pathologist or radiologist decides it is ready to leave the lab.",
    book: { to: "/reports", label: "Open your reports" },
    intro: [
      "Every Aurora report stays in review until a doctor signs it. That is why a same-day test can still appear in the evening, and why a scan is not emailed from the machine.",
      "The patient page shows tracking until that signature. Staff can see the queue. You see only your own file.",
    ],
    sections: [
      {
        id: "the-analyser",
        title: "What the analyser does",
        blocks: [
          { kind: "p", text: "The haematology and chemistry analysers print a first set of numbers once the sample is on the bench. Those numbers are a worksheet. They are not the report you download." },
          { kind: "p", text: "A result can be held because a control was out, a tube was warm from the road, or the analyser asked for a film. Holding it is part of the work, not a delay for its own sake." },
        ],
      },
      {
        id: "review",
        title: "What review means",
        blocks: [
          { kind: "p", text: "Review is the step between the worksheet and the file you can open. A pathologist, or a radiologist for a scan, looks at the numbers, the flags, and any note from the bench." },
          {
            kind: "ul",
            items: [
              "Booked: the slot is on the book",
              "Collected: the sample is in a labelled tube",
              "Accessioned: it has a place on the rack",
              "Processing: the analyser is running",
              "Review: a doctor has the worksheet",
              "Released: the report is signed and yours to download",
            ],
          },
        ],
      },
      {
        id: "flags",
        title: "A flag is not a diagnosis",
        blocks: [
          { kind: "p", text: "A high or low mark is a comparison with the range used that day. It tells you the number sits outside that range. It does not name an illness." },
          { kind: "p", text: "The note on the report says what was measured. Take that page to the doctor who asked for the test. The lab does not start treatment from a flag." },
        ],
      },
      {
        id: "download",
        title: "How you open the file",
        blocks: [
          { kind: "p", text: "Sign in with the mobile number on the booking. The report appears after the status moves to Released. A different number will not see that file." },
          { kind: "p", text: "If the page still says Review, the doctor has not signed yet. Calling the desk is reasonable if the stated time has passed. The number is 0884 232 4500." },
        ],
      },
    ],
    summary: "A report leaves Ferry Road only after a doctor signs it. Until then the page shows where the sample is. A high or low flag is a marker for your doctor, not a diagnosis from the lab.",
    faqs: [
      { q: "Why is a same-day test not on my phone at noon?", a: "The analyser may have finished, and the report is still in review. It is released when a doctor signs it, often later the same day for routine blood tests." },
      { q: "Can the desk read the result out before it is signed?", a: "No. Unsigned numbers stay on the worksheet. The desk can tell you the status, not the values." },
      { q: "Who sees my report?", a: "You, with the mobile number on the booking, and the staff working that file. Another patient cannot open it." },
    ],
  },
  {
    slug: "what-can-come-home",
    date: "4 Aug 2026",
    tag: "Home visit",
    image: "/news/home.jpg",
    title: "What a phlebotomist can collect at home",
    excerpt: "Most blood and urine tests travel. Ultrasound, X-ray, ECG, and echo stay at Ferry Road.",
    book: { to: "/collection", label: "Book a home visit" },
    intro: [
      "Home collection covers Yanam town, Mettakuru, Dariyalatippa, and Farampeta from 7:00 AM. The person at the door brings a sealed kit and a labelled tube. They do not bring an ultrasound machine.",
      "If a test on your list cannot travel, the booking page says so before you pay.",
    ],
    sections: [
      {
        id: "what-travels",
        title: "What can be collected at home",
        blocks: [
          { kind: "p", text: "Most blood and urine tests on the Yanam menu can be drawn at the door. That includes counts, lipids, sugar, thyroid, vitamins, liver and kidney panels, iron studies, and a fever panel." },
          {
            kind: "ul",
            items: [
              "A venous blood sample in the right tube",
              "A urine sample you have ready, in a clean container",
              "A fasting sample, if you have actually fasted",
            ],
          },
          { kind: "p", text: "The tube is logged for temperature on the way back to Ferry Road. A warm tube is rejected and the draw is repeated." },
        ],
      },
      {
        id: "stays-at-the-centre",
        title: "What stays at Ferry Road",
        blocks: [
          { kind: "p", text: "Scans and heart tracings need the room, the machine, and someone on site. These are not home visits:" },
          {
            kind: "ul",
            items: [
              "Ultrasound",
              "Digital X-ray and mammography",
              "ECG, echo, and the treadmill",
              "MRI and CT, which are not done in Yanam",
            ],
          },
          { kind: "p", text: "The Mettakuru desk takes drop-offs until 1:00 PM. It does not run those machines either." },
        ],
      },
      {
        id: "visit-fee",
        title: "When a visit fee applies",
        blocks: [
          { kind: "p", text: "The home visit fee is ₹150 when the basket is under ₹500. At ₹500 or more, the visit is included." },
          { kind: "p", text: "The fee is for the trip across town, not a charge on each tube. One address, one morning, one fee." },
        ],
      },
      {
        id: "mixed-checkup",
        title: "When a checkup mixes both",
        blocks: [
          { kind: "p", text: "Heart Screen and Executive Platinum include an ECG, an echo, or an ultrasound along with blood tests. Those mornings are at Ferry Road, so the scan and the blood draw happen in one place." },
          { kind: "p", text: "You can still book only the blood tests for home collection and come to the centre for the scan on another day. The booking page will not pretend a machine can travel." },
        ],
      },
    ],
    summary: "Blood and urine can come to the door from 7:00 AM. Ultrasound, X-ray, ECG, and echo stay at Ferry Road. If the basket is under ₹500, the home visit fee is ₹150.",
    faqs: [
      { q: "Which places are covered?", a: "Yanam town, Mettakuru, Dariyalatippa, and Farampeta. The first slot is 7:00 AM." },
      { q: "Can an ECG be done at home?", a: "No. ECG, echo, ultrasound, and X-ray are at the Ferry Road centre." },
      { q: "What if my checkup includes a scan?", a: "Book the centre visit, or split the blood tests for home collection and the scan for Ferry Road." },
    ],
  },
]

export function postBySlug(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function readMinutes(post: Post) {
  const words = [
    post.excerpt,
    ...post.intro,
    ...post.sections.flatMap((section) => [section.title, ...section.blocks.flatMap((block) => (block.kind === "p" ? [block.text] : block.items))]),
    post.summary,
    ...post.faqs.flatMap((item) => [item.q, item.a]),
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(3, Math.round(words / 180))
}
