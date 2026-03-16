import { CheckCircle2, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function FlashMessage({
  type = "success",
  message,
}: {
  type?: "success" | "error";
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "animate-enter flex items-start gap-3 rounded-3xl border px-4 py-4 text-sm shadow-[0_12px_30px_rgba(23,32,51,0.08)]",
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-rose-200 bg-rose-50 text-rose-900",
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <p>{message}</p>
    </div>
  );
}
