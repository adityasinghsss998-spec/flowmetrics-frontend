import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[4px] font-mono text-sm font-medium whitespace-nowrap outline-none select-none focus-visible:outline-2 focus-visible:outline-[var(--fm-accent)] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "fm-btn-accent",
        accent: "fm-btn-accent",
        outline: "fm-btn-quiet border border-border bg-transparent",
        quiet: "fm-btn-quiet border border-border bg-transparent",
        secondary:
          "fm-btn-quiet bg-secondary border border-border",
        ghost:
          "fm-btn-quiet border-transparent bg-transparent",
        destructive:
          "bg-[var(--fm-status-poor)]/15 text-[var(--fm-status-poor)] border border-[var(--fm-status-poor)]/30 hover:bg-[var(--fm-status-poor)]/25",
        link: "fm-inline-link text-[var(--fm-accent)] underline-offset-4",
      },
      size: {
        default: "h-8 gap-1.5 px-3",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-7 gap-1 px-2.5 text-xs",
        lg: "h-9 gap-1.5 px-4",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      aria-busy={loading ? "true" : undefined}
      disabled={props.disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span>{children}</span>
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
