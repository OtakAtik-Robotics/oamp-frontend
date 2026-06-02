import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
  "h-10 w-full min-w-0 rounded-xl border-2 border-[#171717] bg-white px-4 py-2 text-base font-medium shadow-none outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  "focus-visible:shadow-[4px_4px_0_0_#171717] focus-visible:border-[#171717]",
  "aria-invalid:border-destructive",
  className

      )}
      {...props} />
  );
}

export { Input }
