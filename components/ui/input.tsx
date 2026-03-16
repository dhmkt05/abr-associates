import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const baseFieldClassName =
  "w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(31,77,67,0.12)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseFieldClassName, props.className)} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(baseFieldClassName, props.className)} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(baseFieldClassName, "min-h-28 resize-y", props.className)} {...props} />
  );
}
