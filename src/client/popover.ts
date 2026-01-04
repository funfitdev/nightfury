import { computePosition, flip, shift, offset } from "@floating-ui/dom";
import type { Placement } from "@floating-ui/dom";

function getPlacement(content: HTMLElement): Placement {
  const side = content.dataset.side || "bottom";
  const align = content.dataset.align || "center";
  if (align === "center") return side as Placement;
  return `${side}-${align}` as Placement;
}

function positionPopover(trigger: HTMLElement, content: HTMLElement) {
  const placement = getPlacement(content);
  const sideOffset = parseInt(content.dataset.sideOffset || "0");
  const alignOffset = parseInt(content.dataset.alignOffset || "0");

  computePosition(trigger, content, {
    placement,
    middleware: [
      offset({ mainAxis: sideOffset, crossAxis: alignOffset }),
      flip({ fallbackAxisSideDirection: "end" }),
      shift({ padding: 8 }),
    ],
  }).then(({ x, y }) => {
    Object.assign(content.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      margin: 0,
    });
  });
}

function openPopover(container: HTMLElement) {
  const trigger = container.querySelector<HTMLElement>(
    '[data-slot="popover-trigger"]'
  );
  const content = container.querySelector<HTMLDialogElement>(
    '[data-slot="popover-content"]'
  );
  if (!trigger || !content) return;

  content.style.display = "block";
  content.dataset.state = "open";
  trigger.setAttribute("aria-expanded", "true");
  positionPopover(trigger, content);
}

function closePopover(container: HTMLElement) {
  const trigger = container.querySelector<HTMLElement>(
    '[data-slot="popover-trigger"]'
  );
  const content = container.querySelector<HTMLDialogElement>(
    '[data-slot="popover-content"]'
  );
  if (!trigger || !content) return;

  content.style.display = "none";
  content.dataset.state = "closed";
  trigger.setAttribute("aria-expanded", "false");
}

function togglePopover(container: HTMLElement) {
  const content = container.querySelector<HTMLDialogElement>(
    '[data-slot="popover-content"]'
  );
  if (!content) return;

  if (content.dataset.state === "open") {
    closePopover(container);
  } else {
    // Close all other popovers first
    document
      .querySelectorAll<HTMLElement>('[data-slot="popover"]')
      .forEach((p) => {
        if (p !== container) closePopover(p);
      });
    openPopover(container);
  }
}

function initPopover(container: HTMLElement) {
  if (container.dataset.popoverInit) return;
  container.dataset.popoverInit = "true";

  const trigger = container.querySelector<HTMLElement>(
    '[data-slot="popover-trigger"]'
  );
  const content = container.querySelector<HTMLDialogElement>(
    '[data-slot="popover-content"]'
  );
  if (!trigger || !content) return;

  // Ensure content starts hidden
  content.style.display = "none";
  content.dataset.state = "closed";

  // Toggle on trigger click
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePopover(container);
  });

  // Handle close buttons
  container.querySelectorAll<HTMLElement>('[data-slot="popover-close"]').forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      closePopover(container);
    });
  });

  // Close on escape
  container.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePopover(container);
      trigger.focus();
    }
  });
}

function initAllPopovers() {
  const popovers = document.querySelectorAll<HTMLElement>('[data-slot="popover"]');
  console.log("[MWM] Found", popovers.length, "popovers");
  popovers.forEach(initPopover);
}

// Opens any popover elements (dialogs, sheets) that have data-default-open attribute
function openDefaultPopovers() {
  const popovers = document.querySelectorAll<HTMLElement>("[data-default-open]");
  popovers.forEach((el) => {
    if (el.hasAttribute("popover")) {
      el.showPopover();
    }
  });
}

// Click outside to close
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target.closest('[data-slot="popover"]')) {
    document
      .querySelectorAll<HTMLElement>('[data-slot="popover"]')
      .forEach(closePopover);
  }
});

// Expose API globally
declare global {
  interface Window {
    MWMPopover: typeof MWMPopover;
  }
}

const MWMPopover = {
  init: initPopover,
  initAll: initAllPopovers,
  open: openPopover,
  close: closePopover,
  toggle: togglePopover,
  position: positionPopover,
};

window.MWMPopover = MWMPopover;

export function initPopoverComponent() {
  initAllPopovers();
  openDefaultPopovers();
}

export { MWMPopover };
