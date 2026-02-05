import * as React from "react"
import { cn } from "@/lib/utils"

/* =========================
   CARD (GLOBAL GLASS STYLE)
   ========================= */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        `
        relative
        flex flex-col gap-6
        rounded-2xl
        border border-white/10
        bg-gradient-to-b from-black/60 to-black/40
        backdrop-blur-xl
        text-white
        shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        `,
        className
      )}
      {...props}
    />
  )
}

/* =========================
   CARD HEADER
   ========================= */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        `
        grid gap-2 px-6 pt-6
        `,
        className
      )}
      {...props}
    />
  )
}

/* =========================
   CARD TITLE
   ========================= */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  )
}

/* =========================
   CARD DESCRIPTION
   ========================= */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm text-white/60",
        className
      )}
      {...props}
    />
  )
}

/* =========================
   CARD ACTION
   ========================= */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "absolute right-4 top-4",
        className
      )}
      {...props}
    />
  )
}

/* =========================
   CARD CONTENT
   ========================= */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-6 pb-6",
        className
      )}
      {...props}
    />
  )
}

/* =========================
   CARD FOOTER
   ========================= */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 border-t border-white/10 px-6 py-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
