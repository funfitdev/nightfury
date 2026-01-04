import * as React from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SheetContextValue {
  sheetId: string;
  defaultOpen?: boolean;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet");
  }
  return context;
}

interface SheetProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Sheet({ children, defaultOpen }: SheetProps) {
  const id = React.useId();
  const sheetId = `sheet${id.replace(/:/g, "")}`;

  return (
    <SheetContext.Provider value={{ sheetId, defaultOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

interface SheetTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function SheetTrigger({ className, children, ...props }: SheetTriggerProps) {
  const { sheetId } = useSheetContext();

  return (
    <button
      type="button"
      data-slot="sheet-trigger"
      popoverTarget={sheetId}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface SheetCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function SheetClose({ className, children, ...props }: SheetCloseProps) {
  const { sheetId } = useSheetContext();

  return (
    <button
      type="button"
      data-slot="sheet-close"
      popoverTarget={sheetId}
      popoverTargetAction="hide"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  const { sheetId, defaultOpen } = useSheetContext();

  return (
    <div
      id={sheetId}
      popover="auto"
      data-slot="sheet-content"
      data-side={side}
      data-default-open={defaultOpen || undefined}
      className={cn(
        "bg-background fixed z-50 m-0 hidden max-h-none max-w-none flex-col gap-4 shadow-lg",
        "[&:popover-open]:flex",
        side === "right" &&
          "top-0 right-0 bottom-0 left-auto h-dvh w-3/4 border-l sm:max-w-sm",
        side === "left" &&
          "top-0 left-0 right-auto bottom-0 h-dvh w-3/4 border-r sm:max-w-sm",
        side === "top" &&
          "top-0 right-0 left-0 bottom-auto w-full border-b",
        side === "bottom" &&
          "bottom-0 right-0 left-0 top-auto w-full border-t",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <button
          type="button"
          data-slot="sheet-close"
          popoverTarget={sheetId}
          popoverTargetAction="hide"
          className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

interface SheetTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <div
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <div
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
export type {
  SheetProps,
  SheetTriggerProps,
  SheetCloseProps,
  SheetContentProps,
  SheetHeaderProps,
  SheetFooterProps,
  SheetTitleProps,
  SheetDescriptionProps,
};
