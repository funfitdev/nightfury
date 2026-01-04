// Opens any popover elements (dialogs, sheets) that have data-default-open attribute
function openDefaultPopovers() {
  const popovers = document.querySelectorAll<HTMLElement>("[data-default-open]");
  console.log("[MWM] Found", popovers.length, "popovers with data-default-open");
  popovers.forEach((el) => {
    if (el.hasAttribute("popover")) {
      console.log("[MWM] Opening popover:", el.id);
      el.showPopover();
    }
  });
}

export function initDialogComponent() {
  openDefaultPopovers();
}
