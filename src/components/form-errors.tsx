import { Alert, AlertTitle, AlertDescription } from "@/components/mwm-ui/alert";
import { AlertCircle } from "lucide-react";

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="text-destructive text-sm mt-1">
      {errors.map((error, i) => (
        <p key={i}>{error}</p>
      ))}
    </div>
  );
}

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
