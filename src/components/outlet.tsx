import { createContext, useContext, type ReactNode } from "react";

// Context to pass the child content to Outlet
const OutletContext = createContext<ReactNode>(null);

// Outlet component - renders the child route inside a layout
export function Outlet() {
  const children = useContext(OutletContext);
  return <>{children}</>;
}

// Provider to wrap layouts with their child content
export function OutletProvider({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) {
  return (
    <OutletContext.Provider value={content}>{children}</OutletContext.Provider>
  );
}
