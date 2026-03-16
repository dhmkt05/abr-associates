"use client";

import type { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  onClick,
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
  variant?: Variant;
}) {
  return (
    <Button
      variant={variant}
      {...props}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
    >
      {children}
    </Button>
  );
}
