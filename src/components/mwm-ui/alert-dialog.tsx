import * as React from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/mwm-ui/button";

interface AlertDialogContextValue {
  dialogId: string;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(
  null
);

function useAlertDialogContext() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error(
      "AlertDialog components must be used within an AlertDialog"
    );
  }
  return context;
}

interface AlertDialogProps {
  children: React.ReactNode;
}

function AlertDialog({ children }: AlertDialogProps) {
  const id = React.useId();
  const dialogId = `alert-dialog${id.replace(/:/g, "")}`;

  return (
    <AlertDialogContext.Provider value={{ dialogId }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

interface AlertDialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function AlertDialogTrigger({
  className,
  children,
  ...props
}: AlertDialogTriggerProps) {
  const { dialogId } = useAlertDialogContext();

  return (
    <button
      type="button"
      data-slot="alert-dialog-trigger"
      popoverTarget={dialogId}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface AlertDialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function AlertDialogContent({
  className,
  children,
  ...props
}: AlertDialogContentProps) {
  const { dialogId } = useAlertDialogContext();

  return (
    <div
      id={dialogId}
      popover="manual"
      data-slot="alert-dialog-content"
      className={cn(
        "bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <div
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

interface AlertDialogDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <div
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function AlertDialogAction({
  className,
  children,
  ...props
}: AlertDialogActionProps) {
  const { dialogId } = useAlertDialogContext();

  return (
    <button
      type="button"
      data-slot="alert-dialog-action"
      popoverTarget={dialogId}
      popoverTargetAction="hide"
      className={cn(buttonVariants(), className)}
      {...props}
    >
      {children}
    </button>
  );
}

interface AlertDialogCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function AlertDialogCancel({
  className,
  children,
  ...props
}: AlertDialogCancelProps) {
  const { dialogId } = useAlertDialogContext();

  return (
    <button
      type="button"
      data-slot="alert-dialog-cancel"
      popoverTarget={dialogId}
      popoverTargetAction="hide"
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
export type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogContentProps,
  AlertDialogHeaderProps,
  AlertDialogFooterProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
};
