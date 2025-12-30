import * as React from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DialogContextValue {
  dialogId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
}

interface DialogProps {
  children: React.ReactNode;
}

function Dialog({ children }: DialogProps) {
  const id = React.useId();
  const dialogId = `dialog${id.replace(/:/g, "")}`;

  return (
    <DialogContext.Provider value={{ dialogId }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function DialogTrigger({ className, children, ...props }: DialogTriggerProps) {
  const { dialogId } = useDialogContext();

  return (
    <button
      type="button"
      data-slot="dialog-trigger"
      popoverTarget={dialogId}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface DialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function DialogClose({ className, children, ...props }: DialogCloseProps) {
  const { dialogId } = useDialogContext();

  return (
    <button
      type="button"
      data-slot="dialog-close"
      popoverTarget={dialogId}
      popoverTargetAction="hide"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  const { dialogId } = useDialogContext();

  return (
    <div
      id={dialogId}
      popover="manual"
      data-slot="dialog-content"
      className={cn(
        "bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg outline-none sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <button
          type="button"
          data-slot="dialog-close"
          popoverTarget={dialogId}
          popoverTargetAction="hide"
          className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <div
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <div
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
export type {
  DialogProps,
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogTitleProps,
  DialogTriggerProps,
};
