import { useEffect } from "react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Aurora Diagnostics`
  }, [title])
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="page">{children}</div>
}

export function Button({
  children,
  variant = "solid",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" }) {
  return (
    <button className={`${variant === "solid" ? "solid" : "ghost"} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  children,
  variant = "solid",
}: {
  to: string
  children: ReactNode
  variant?: "solid" | "ghost"
}) {
  return (
    <Link to={to} className={variant === "solid" ? "solid" : "ghost"}>
      {children}
    </Link>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
    </label>
  )
}
