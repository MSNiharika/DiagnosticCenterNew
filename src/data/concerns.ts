import { testById } from "./catalog"
import type { Test } from "./types"

export type Concern = {
  id: string
  label: string
  testIds: string[]
}

export const concerns: Concern[] = [
  { id: "diabetes", label: "Diabetes", testIds: ["hba1c", "lipid", "kft", "urine"] },
  { id: "pregnancy", label: "Pregnancy", testIds: ["bhcg", "cbc", "thyroid", "vitd", "urine"] },
  { id: "thyroid", label: "Thyroid", testIds: ["thyroid", "tsh"] },
  { id: "liver", label: "Liver", testIds: ["lft", "usg-abd"] },
  { id: "prostate", label: "Prostate", testIds: ["psa"] },
  { id: "fertility", label: "Fertility", testIds: ["bhcg", "thyroid", "tsh", "vitd"] },
  { id: "bone", label: "Bone", testIds: ["vitd", "xray"] },
  { id: "gastro", label: "Gastro", testIds: ["lft", "usg-abd", "cbc"] },
  { id: "cervix", label: "Cervix", testIds: ["hpv"] },
  { id: "heart", label: "Heart", testIds: ["lipid", "ecg", "echo", "tmt"] },
  { id: "kidney", label: "Kidney", testIds: ["creatinine", "urine", "urea", "kft"] },
  { id: "cancer", label: "Cancer", testIds: ["psa", "hpv", "mammo"] },
  { id: "breast", label: "Breast", testIds: ["mammo"] },
  { id: "vitamins", label: "Vitamins", testIds: ["vitd", "iron", "ferritin"] },
  { id: "anemia", label: "Anemia", testIds: ["cbc", "iron", "ferritin"] },
  { id: "lungs", label: "Lungs", testIds: ["xray", "ct-chest", "cbc", "crp"] },
  { id: "fever", label: "Fever", testIds: ["dengue", "cbc", "crp", "urine"] },
]

export function concernById(id: string) {
  return concerns.find((item) => item.id === id)
}

export function testsForConcern(id: string): Test[] {
  const concern = concernById(id)
  if (!concern) return []
  return concern.testIds.map((testId) => testById(testId)).filter((test): test is Test => Boolean(test))
}
