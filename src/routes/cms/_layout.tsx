import { AppSidebar } from "@/components/nav/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/mwm-ui/sidebar";
import { Outlet } from "@/components/outlet";
import { requireAuthAsync } from "@/lib/session";

export default async function CmsLayout(req: Request) {
  await requireAuthAsync(req);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="h-dvh overflow-hidden"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
