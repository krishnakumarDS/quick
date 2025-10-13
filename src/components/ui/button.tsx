import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-card hover:shadow-elevated hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-card hover:shadow-elevated",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-card hover:shadow-elevated",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-card hover:shadow-elevated hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-white hover:scale-105 shadow-elevated hover:shadow-glow font-semibold rounded-xl",
        success: "bg-gradient-fresh text-white hover:scale-105 shadow-card hover:shadow-elevated",
        food: "bg-white text-primary border-2 border-primary/20 hover:bg-primary hover:text-white hover:border-primary shadow-card hover:shadow-elevated hover:-translate-y-0.5",
        glow: "bg-gradient-sunset text-white shadow-glow hover:scale-105 hover:shadow-glow font-semibold",
        ocean: "bg-gradient-ocean text-white hover:scale-105 shadow-card hover:shadow-elevated",
        glass: "glass-card text-foreground hover:bg-white/90 hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-11 w-11 rounded-lg",
        xl: "h-16 rounded-2xl px-12 text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
