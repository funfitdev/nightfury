import "htmx.org";
import { computePosition, flip, shift, offset } from "@floating-ui/dom";

// Dropdown Menu functionality
type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

function getPlacement(content: HTMLElement): Placement {
  const side = content.dataset.side || "bottom";
  const align = content.dataset.align || "start";
  if (align === "center") return side as Placement;
  return `${side}-${align}` as Placement;
}

function positionDropdown(trigger: HTMLElement, content: HTMLElement) {
  const placement = getPlacement(content);
  const offsetValue = parseInt(content.dataset.sideOffset || "4");

  computePosition(trigger, content, {
    placement,
    middleware: [
      offset(offsetValue),
      flip({ fallbackAxisSideDirection: "end" }),
      shift({ padding: 8 }),
    ],
  }).then(({ x, y }) => {
    Object.assign(content.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  });
}

function openDropdown(container: HTMLElement) {
  const trigger = container.querySelector<HTMLElement>(
    '[data-slot="dropdown-menu-trigger"]'
  );
  const content = container.querySelector<HTMLElement>(
    '[data-slot="dropdown-menu-content"]'
  );
  if (!trigger || !content) return;

  content.style.display = "block";
  content.dataset.state = "open";
  trigger.setAttribute("aria-expanded", "true");
  positionDropdown(trigger, content);
}

function closeDropdown(container: HTMLElement) {
  const trigger = container.querySelector<HTMLElement>(
    '[data-slot="dropdown-menu-trigger"]'
  );
  const content = container.querySelector<HTMLElement>(
    '[data-slot="dropdown-menu-content"]'
  );
  if (!trigger || !content) return;

  content.style.display = "none";
  content.dataset.state = "closed";
  trigger.setAttribute("aria-expanded", "false");
}

function toggleDropdown(container: HTMLElement) {
  const content = container.querySelector<HTMLElement>(
    '[data-slot="dropdown-menu-content"]'
  );
  if (!content) return;

  if (content.dataset.state === "open") {
    closeDropdown(container);
  } else {
    // Close all other dropdowns first
    document
      .querySelectorAll<HTMLElement>('[data-slot="dropdown-menu"]')
      .forEach((d) => {
        if (d !== container) closeDropdown(d);
      });
    openDropdown(container);
  }
}

function initDropdown(container: HTMLElement) {
  if (container.dataset.dropdownInit) return;
  container.dataset.dropdownInit = "true";

  const trigger = container.querySelector<HTMLElement>(
    '[data-slot="dropdown-menu-trigger"]'
  );
  const content = container.querySelector<HTMLElement>(
    '[data-slot="dropdown-menu-content"]'
  );
  if (!trigger || !content) return;

  // Toggle on trigger click
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(container);
  });

  // Close on item click if data-close-on-click is not "false"
  content.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const item = target.closest<HTMLElement>('[data-slot="dropdown-menu-item"]');
    if (item && item.dataset.closeOnClick !== "false") {
      closeDropdown(container);
    }
  });

  // Close on escape
  container.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown(container);
      trigger.focus();
    }
  });
}

function initAllDropdowns() {
  document
    .querySelectorAll<HTMLElement>('[data-slot="dropdown-menu"]')
    .forEach(initDropdown);
}

// Click outside to close
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target.closest('[data-slot="dropdown-menu"]')) {
    document
      .querySelectorAll<HTMLElement>('[data-slot="dropdown-menu"]')
      .forEach(closeDropdown);
  }
});

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllDropdowns);
} else {
  initAllDropdowns();
}

// HTMX integration
document.addEventListener("htmx:afterSettle", ((e: CustomEvent) => {
  const target = e.detail.target as HTMLElement;
  if (target) {
    const dropdown = target.closest<HTMLElement>('[data-slot="dropdown-menu"]');
    if (dropdown) initDropdown(dropdown);
    target
      .querySelectorAll<HTMLElement>('[data-slot="dropdown-menu"]')
      .forEach(initDropdown);
  }
}) as EventListener);

document.addEventListener("htmx:afterSwap", ((e: CustomEvent) => {
  const target = e.detail.target as HTMLElement;
  if (target) {
    const dropdown = target.closest<HTMLElement>('[data-slot="dropdown-menu"]');
    if (dropdown) initDropdown(dropdown);
    target
      .querySelectorAll<HTMLElement>('[data-slot="dropdown-menu"]')
      .forEach(initDropdown);
  }
}) as EventListener);

// Expose API globally
declare global {
  interface Window {
    MWMDropdown: typeof MWMDropdown;
  }
}

const MWMDropdown = {
  init: initDropdown,
  initAll: initAllDropdowns,
  open: openDropdown,
  close: closeDropdown,
  toggle: toggleDropdown,
  position: positionDropdown,
};

window.MWMDropdown = MWMDropdown;

export { MWMDropdown };
