import "htmx.org";
import { initDropdownMenu } from "./dropdown-menu";
import { initSidebarMenu } from "./sidebar";
import { initPopoverComponent } from "./popover";
import { initToggleComponent } from "./toggle";
import { initToggleGroupComponent } from "./toggle-group";
import { initTabsComponent } from "./tabs";

// Initialize all components on DOM ready
function initAllComponents() {
  console.log("[MWM] Initializing components, readyState:", document.readyState);
  initDropdownMenu();
  initSidebarMenu();
  initPopoverComponent();
  initToggleComponent();
  initToggleGroupComponent();
  initTabsComponent();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllComponents);
} else {
  initAllComponents();
}

// Re-initialize after HTMX swaps
document.addEventListener("htmx:afterSettle", () => initAllComponents());
document.addEventListener("htmx:afterSwap", () => initAllComponents());
