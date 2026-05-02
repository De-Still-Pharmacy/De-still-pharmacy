import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: boolean;
}

const ALWAYS_FLOAT_TYPES = ["date", "datetime-local", "month", "week", "time"];

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, id, error, type, placeholder: _placeholder, ...props }, ref) => {
    const alwaysFloat = ALWAYS_FLOAT_TYPES.includes(type || "");

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder=" "
          className={cn(
            "peer h-[52px] w-full rounded-xl border bg-transparent px-4 pt-5 pb-2 text-sm outline-none transition-all",
            "border-input hover:border-ring/50",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:pointer-events-none disabled:opacity-50 disabled:bg-muted/30",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 text-sm text-muted-foreground transition-all duration-200 origin-left",
            alwaysFloat
              ? "top-3 translate-y-0 scale-[0.8] font-medium"
              : "top-1/2 -translate-y-1/2 peer-focus:top-3 peer-focus:translate-y-0 peer-focus:scale-[0.8] peer-focus:font-medium peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-[0.8] peer-[:not(:placeholder-shown)]:font-medium",
            "peer-focus:text-primary",
            error && "peer-focus:text-destructive"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
