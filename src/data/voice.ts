export const testLines: Record<string, string> = {
  cbc: "The usual first blood test: red cells, white cells, and platelets on one page.",
  lipid: "Cholesterol and triglycerides, read with blood pressure and sugar — not on their own.",
  hba1c: "Your average sugar over about three months. No need to fast.",
  thyroid: "T3, T4, and TSH together, when a single TSH is not enough.",
  tsh: "The screening test for the thyroid. Often the only one a yearly checkup needs.",
  vitd: "The storage form of vitamin D. Worth knowing before anyone starts a supplement.",
  lft: "How the liver is handling enzymes, bilirubin, and protein.",
  kft: "Urea, creatinine, and salts. Useful in diabetes care and before a scan with dye.",
  creatinine: "One number for the kidney filter. Often asked before contrast.",
  urea: "Read next to creatinine when the question is the kidneys.",
  iron: "Serum iron and the carrying capacity. Clearer than haemoglobin alone.",
  ferritin: "Iron stores. They can fall while the blood count still looks fine.",
  urine: "A midstream sample. Part of fever checks and most wellness packages.",
  crp: "Inflammation. It rises with infection and should settle as you do.",
  dengue: "Best in the first few days of a fever. Same-day result.",
  psa: "A prostate marker. One number is not a diagnosis.",
  bhcg: "A blood pregnancy test, more precise than a urine card when dates matter.",
  hpv: "A cervical swab in a private room. This one does not travel home.",
  "mri-brain": "A brain MRI, reported after a radiologist has read it.",
  "ct-chest": "A thin-slice look at the lungs. Centre only.",
  "usg-abd": "Liver, gallbladder, kidneys, and spleen. Come fasting.",
  mammo: "Both sides, read with a BIRADS score. Skip deodorant that morning.",
  xray: "A chest film and a written report. Usually the same day.",
  ecg: "A resting heart tracing. Ten quiet minutes, then the wires.",
  echo: "Ultrasound of the heart and valves. You stay at Ferry Road.",
  tmt: "A supervised walk on a treadmill while the tracing is watched.",
}

export const packageLines: Record<string, string> = {
  essential: "Six tests a doctor asks for when nothing in particular hurts and the year has turned.",
  diabetes: "Sugar control, kidneys, lipids, and inflammation between clinic visits.",
  women: "Thyroid, vitamin D, and iron stores — for tiredness a blood count does not explain.",
  heart: "Lipids, an ECG, and an echo. One morning at the cardiac desk.",
  senior: "A wider panel and a tracing, with a longer chair. PSA is included.",
  executive: "Blood, heart, and an abdominal ultrasound. Someone stays with you from the door to the report.",
  fever: "Dengue antigen, blood count, CRP, and urine. No fasting, and it is prioritised.",
}

export function explainFlag(name: string, flag?: "H" | "L") {
  if (flag === "H") return `${name} is above the range printed on the report. Show it to your doctor. This page does not tell you what to take.`
  if (flag === "L") return `${name} is below the range printed on the report. Show it to your doctor. This page does not tell you what to take.`
  return `${name} sits inside the reference range.`
}
