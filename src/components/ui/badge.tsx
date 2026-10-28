import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-[4px] border border-transparent font-mono px-2 py-0.5 text-xs font-normal whitespace-nowrap transition-colors outline-none [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[var(--fm-accent)] text-[var(--fm-on-accent)] font-medium",
        secondary:
          "bg-[var(--fm-surface)] text-[var(--fm-text)] border-border",
        destructive:
          "bg-[var(--fm-status-poor)]/15 text-[var(--fm-status-poor)] border border-[var(--fm-status-poor)]/30",
        outline:
          "border-border text-[var(--fm-text-muted)] bg-transparent",
        ghost:
          "hover:bg-muted hover:text-foreground",
        link: "text-[var(--fm-accent)] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
