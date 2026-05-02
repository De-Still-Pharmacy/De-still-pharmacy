"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "@/lib/utils";
import { SelectContent } from "@/components/ui/select";
import { ChevronDownIcon } from "lucide-react";

interface FloatingSelectProps {
  label: string;
  id?: string;
  name?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  error?: boolean;
}

function FloatingSelect({
  label,
  id,
  name,
  required,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  error,
}: FloatingSelectProps) {
  const [hasValue, setHasValue] = React.useState(!!defaultValue || !!value);

  const handleValueChange = React.useCallback(
    (val: string) => {
      setHasValue(!!val);
      onValueChange?.(val);
    },
    [onValueChange]
  );

  React.useEffect(() => {
    setHasValue(!!value || !!defaultValue);
  }, [value, defaultValue]);

  return (
    <div className={cn("relative", className)}>
      <SelectPrimitive.Root
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onValueChange={handleValueChange as never}
      >
        <SelectPrimitive.Trigger
          id={id}
          className={cn(
            "peer flex h-[52px] w-full items-center justify-between rounded-xl border bg-transparent px-4 pt-5 pb-2 text-sm outline-none transition-all select-none",
            "border-input hover:border-ring/50",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
            "data-placeholder:text-transparent",
            error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
        >
          <SelectPrimitive.Value
            className="flex flex-1 text-left truncate"
            placeholder=" "
          />
          <SelectPrimitive.Icon
            render={
              <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground shrink-0" />
            }
          />
        </SelectPrimitive.Trigger>
        <SelectContent>{children}</SelectContent>
      </SelectPrimitive.Root>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-4 text-sm text-muted-foreground transition-all duration-200 origin-left z-10",
          hasValue
            ? "top-3 translate-y-0 scale-[0.8] font-medium"
            : "top-1/2 -translate-y-1/2",
          error && "text-destructive"
        )}
      >
        {label}
      </label>
    </div>
  );
}

export { FloatingSelect };
