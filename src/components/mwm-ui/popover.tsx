import * as React from "react";

import { cn } from "@/lib/utils";

interface PopoverContextValue {
  popoverId: string;
  anchorName: string;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover");
  }
  return context;
}

interface PopoverProps {
  children: React.ReactNode;
}

function Popover({ children }: PopoverProps) {
  const id = React.useId();
  const popoverId = `popover${id.replace(/:/g, "")}`;
  const anchorName = `--anchor${id.replace(/:/g, "")}`;

  return (
    <PopoverContext.Provider value={{ popoverId, anchorName }}>
      {children}
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

function PopoverTrigger({
  className,
  children,
  asChild,
  style,
  ...props
}: PopoverTriggerProps) {
  const { popoverId, anchorName } = usePopoverContext();

  const anchorStyle = {
    ...style,
    anchorName,
  } as React.CSSProperties;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      popoverTarget: popoverId,
      style: anchorStyle,
    });
  }

  return (
    <button
      type="button"
      data-slot="popover-trigger"
      popoverTarget={popoverId}
      className={className}
      style={anchorStyle}
      {...props}
    >
      {children}
    </button>
  );
}

interface PopoverContentProps
  extends React.DialogHTMLAttributes<HTMLDialogElement> {
  /** The preferred side of the anchor to render against */
  side?: "top" | "right" | "bottom" | "left";
  /** The distance in pixels from the anchor */
  sideOffset?: number;
  /** The preferred alignment against the anchor */
  align?: "start" | "center" | "end";
  /** An offset in pixels from the align option */
  alignOffset?: number;
}

function PopoverContent({
  className,
  side = "bottom",
  sideOffset = 0,
  align = "center",
  alignOffset = 0,
  children,
  style,
  ...props
}: PopoverContentProps) {
  const { popoverId, anchorName } = usePopoverContext();

  // Build position styles based on side and align
  const getPositionStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      position: "absolute",
      positionAnchor: anchorName,
      margin: 0,
    } as React.CSSProperties;

    // Side positioning
    switch (side) {
      case "top":
        (styles as any).bottom = `anchor(top)`;
        (styles as any).marginBottom = `${sideOffset}px`;
        break;
      case "bottom":
        (styles as any).top = `anchor(bottom)`;
        (styles as any).marginTop = `${sideOffset}px`;
        break;
      case "left":
        (styles as any).right = `anchor(left)`;
        (styles as any).marginRight = `${sideOffset}px`;
        break;
      case "right":
        (styles as any).left = `anchor(right)`;
        (styles as any).marginLeft = `${sideOffset}px`;
        break;
    }

    // Alignment positioning
    if (side === "top" || side === "bottom") {
      switch (align) {
        case "start":
          (styles as any).left = `anchor(left)`;
          if (alignOffset) (styles as any).marginLeft = `${alignOffset}px`;
          break;
        case "center":
          (styles as any).left = `anchor(center)`;
          (styles as any).transform = "translateX(-50%)";
          break;
        case "end":
          (styles as any).right = `anchor(right)`;
          if (alignOffset) (styles as any).marginRight = `${alignOffset}px`;
          break;
      }
    } else {
      switch (align) {
        case "start":
          (styles as any).top = `anchor(top)`;
          if (alignOffset) (styles as any).marginTop = `${alignOffset}px`;
          break;
        case "center":
          (styles as any).top = `anchor(center)`;
          (styles as any).transform = "translateY(-50%)";
          break;
        case "end":
          (styles as any).bottom = `anchor(bottom)`;
          if (alignOffset) (styles as any).marginBottom = `${alignOffset}px`;
          break;
      }
    }

    return styles;
  };

  return (
    <dialog
      id={popoverId}
      popover="auto"
      data-slot="popover-content"
      data-side={side}
      data-align={align}
      className={cn(
        "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-none",
        className
      )}
      style={{
        ...getPositionStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </dialog>
  );
}

interface PopoverCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function PopoverClose({ className, children, ...props }: PopoverCloseProps) {
  const { popoverId } = usePopoverContext();

  return (
    <button
      type="button"
      data-slot="popover-close"
      popoverTarget={popoverId}
      popoverTargetAction="hide"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface PopoverAnchorProps extends React.HTMLAttributes<HTMLDivElement> {}

function PopoverAnchor({ className, style, ...props }: PopoverAnchorProps) {
  const { anchorName } = usePopoverContext();

  return (
    <div
      data-slot="popover-anchor"
      className={className}
      style={{
        ...style,
        anchorName,
      } as React.CSSProperties}
      {...props}
    />
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverClose, PopoverAnchor };
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverCloseProps,
  PopoverAnchorProps,
};
