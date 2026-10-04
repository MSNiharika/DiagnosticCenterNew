import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { Gender } from "../data/types"

export type Member = {
  id: string
  name: string
  age: string
  gender: Gender
  relation: string
  dob?: string
}

type Family = {
  members: Member[]
  add: (member: Omit<Member, "id">) => void
  update: (id: string, member: Omit<Member, "id">) => void
  remove: (id: string) => void
}

const Ctx = createContext<Family | null>(null)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const raw = localStorage.getItem("lumen-family")
      return raw ? (JSON.parse(raw) as Member[]) : []
    } catch {
      return []
    }
  })
  useEffect(() => {
    localStorage.setItem("lumen-family", JSON.stringify(members))
  }, [members])
  return (
    <Ctx.Provider
      value={{
        members,
        add: (member) => setMembers((rows) => [{ ...member, id: `FM-${Date.now().toString().slice(-4)}` }, ...rows]),
        update: (id, member) => setMembers((rows) => rows.map((row) => (row.id === id ? { ...member, id } : row))),
        remove: (id) => setMembers((rows) => rows.filter((row) => row.id !== id)),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useFamily() {
  const value = useContext(Ctx)
  if (!value) throw new Error("Family missing")
  return value
}
