import { Alert, AlertTitle, AlertDescription } from "@/components/mwm-ui/alert";
import { AlertCircle } from "lucide-react";

export function GlobalError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
