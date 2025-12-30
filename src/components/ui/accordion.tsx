import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When set, only one item can be open at a time.
   * All AccordionItems will share this name attribute.
   */
  type?: "single" | "multiple";
  /** Name used for exclusive accordion behavior (single mode) */
  name?: string;
}

function Accordion({
  type = "single",
  name,
  className,
  children,
  ...props
}: AccordionProps) {
  // Generate a unique name for single-type accordions if not provided
  const accordionName = type === "single" ? name || React.useId() : undefined;

  return (
    <div data-slot="accordion" className={className} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<AccordionItemProps>(child)) {
          return React.cloneElement(child, {
            accordionName: type === "single" ? accordionName : undefined,
          });
        }
        return child;
      })}
    </div>
  );
}

interface AccordionItemProps
  extends React.DetailsHTMLAttributes<HTMLDetailsElement> {
  /** Internal: passed from Accordion for exclusive behavior */
  accordionName?: string;
  value?: string;
}

function AccordionItem({
  className,
  accordionName,
  value,
  ...props
}: AccordionItemProps) {
  return (
    <details
      data-slot="accordion-item"
      name={accordionName}
      className={cn("group/accordion border-b last:border-b-0", className)}
      {...props}
    />
  );
}

interface AccordionTriggerProps extends React.HTMLAttributes<HTMLElement> {}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  return (
    <summary
      data-slot="accordion-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 cursor-pointer list-none items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&::-webkit-details-marker]:hidden",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 group-open/accordion:rotate-180" />
    </summary>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <div
      data-slot="accordion-content"
      className="accordion-content overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
};
