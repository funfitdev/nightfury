import { Separator } from "@/components/mwm-ui/separator";
import { SidebarTrigger } from "@/components/mwm-ui/sidebar";
import { cn } from "@/lib/utils";
import React from "react";

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

interface PageFooterProps {
  children: React.ReactNode;
  className?: string;
}

function PageRoot({ children, className }: PageProps) {
  return (
    <div
      className={cn("grid h-full overflow-hidden", className)}
      style={{
        gridTemplateRows: "auto 1fr auto",
        gridTemplateColumns: "1fr",
      }}
    >
      {children}
    </div>
  );
}

function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-(--header-height) items-center gap-2 border-b",
        "transition-[width,height] ease-linear",
        "group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        className
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {children}
      </div>
    </header>
  );
}

function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("overflow-auto @container/main", className)}>
      {children}
    </div>
  );
}

function PageFooter({ children, className }: PageFooterProps) {
  return (
    <footer
      className={cn("border-t bg-background p-4", className)}
      style={{
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: "calc(var(--radius) + 4px)",
        borderBottomRightRadius: "calc(var(--radius) + 4px)",
      }}
    >
      {children}
    </footer>
  );
}

// Compound component pattern
export const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  Content: PageContent,
  Footer: PageFooter,
});
