import * as React from "react";

import { cn } from "@/lib/utils";

interface DrawerContextValue {
  drawerId: string;
  direction: "top" | "right" | "bottom" | "left";
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within a Drawer");
  }
  return context;
}

interface DrawerProps {
  children: React.ReactNode;
  direction?: "top" | "right" | "bottom" | "left";
}

function Drawer({ children, direction = "bottom" }: DrawerProps) {
  const id = React.useId();
  const drawerId = `drawer${id.replace(/:/g, "")}`;

  return (
    <DrawerContext.Provider value={{ drawerId, direction }}>
      {children}
    </DrawerContext.Provider>
  );
}

interface DrawerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function DrawerTrigger({ className, children, ...props }: DrawerTriggerProps) {
  const { drawerId } = useDrawerContext();

  return (
    <button
      type="button"
      data-slot="drawer-trigger"
      popoverTarget={drawerId}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface DrawerCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function DrawerClose({ className, children, ...props }: DrawerCloseProps) {
  const { drawerId } = useDrawerContext();

  return (
    <button
      type="button"
      data-slot="drawer-close"
      popoverTarget={drawerId}
      popoverTargetAction="hide"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function DrawerContent({
  className,
  children,
  ...props
}: DrawerContentProps) {
  const { drawerId, direction } = useDrawerContext();

  return (
    <div
      id={drawerId}
      popover="auto"
      data-slot="drawer-content"
      data-direction={direction}
      className={cn(
        "bg-background fixed z-50 m-0 hidden max-h-none max-w-none flex-col",
        "[&:popover-open]:flex",
        direction === "top" &&
          "top-0 right-0 left-0 bottom-auto w-full max-h-[80vh] rounded-b-lg border-b",
        direction === "bottom" &&
          "bottom-0 right-0 left-0 top-auto w-full max-h-[80vh] rounded-t-lg border-t",
        direction === "right" &&
          "top-0 right-0 bottom-0 left-auto h-dvh w-3/4 border-l sm:max-w-sm",
        direction === "left" &&
          "top-0 left-0 right-auto bottom-0 h-dvh w-3/4 border-r sm:max-w-sm",
        className
      )}
      {...props}
    >
      {direction === "bottom" && (
        <div className="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />
      )}
      {children}
    </div>
  );
}

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  const { direction } = useDrawerContext();

  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 md:gap-1.5",
        (direction === "bottom" || direction === "top") &&
          "text-center md:text-left",
        className
      )}
      {...props}
    />
  );
}

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

interface DrawerTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <div
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <div
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
export type {
  DrawerProps,
  DrawerTriggerProps,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerHeaderProps,
  DrawerFooterProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
};
