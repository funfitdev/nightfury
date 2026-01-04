import { Button } from "@/components/mwm-ui/button";
import {
  DialogClose,
  DialogFooter,
} from "@/components/mwm-ui/dialog";
import { Input } from "@/components/mwm-ui/input";
import { Label } from "@/components/mwm-ui/label";
import { FieldError, GlobalError } from "@/components/form-errors";
import { type FormState } from "@/lib/form";
import { z } from "zod";

export const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .regex(/^[a-z][a-z0-9_-]*$/, "Name must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
});

export type RoleFormData = z.infer<typeof roleSchema>;
export type RoleFormState = FormState<RoleFormData>;

export function RoleForm({
  formState,
  role,
}: {
  formState?: RoleFormState;
  role?: { id: string; name: string; displayName: string; description: string | null };
}) {
  const isEdit = !!role;

  return (
    <form
      method="post"
      action={isEdit ? `/admin/roles/${role.id}` : "/admin/roles"}
      className="grid gap-4"
    >
      <GlobalError error={formState?.globalError} />

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., project-manager"
          defaultValue={formState?.values?.name ?? role?.name ?? ""}
          aria-invalid={!!formState?.fieldErrors?.name}
          disabled={isEdit && role?.name === "admin"}
        />
        <p className="text-muted-foreground text-xs">
          Lowercase letters, numbers, hyphens, and underscores only
        </p>
        <FieldError errors={formState?.fieldErrors?.name} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          name="displayName"
          placeholder="e.g., Project Manager"
          defaultValue={formState?.values?.displayName ?? role?.displayName ?? ""}
          aria-invalid={!!formState?.fieldErrors?.displayName}
        />
        <FieldError errors={formState?.fieldErrors?.displayName} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Brief description of this role"
          defaultValue={formState?.values?.description ?? role?.description ?? ""}
          aria-invalid={!!formState?.fieldErrors?.description}
        />
        <FieldError errors={formState?.fieldErrors?.description} />
      </div>

      <DialogFooter>
        <DialogClose>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">{isEdit ? "Update Role" : "Create Role"}</Button>
      </DialogFooter>
    </form>
  );
}
