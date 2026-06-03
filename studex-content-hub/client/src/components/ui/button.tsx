import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva("button-root", {
  variants: {
    intent: {
      primary: "button-primary",
      secondary: "button-secondary",
      ghost: "button-ghost",
    },
    size: {
      md: "button-md",
      sm: "button-sm",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ asChild, className, intent, size, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ intent, size }), className)} {...props} />;
}
