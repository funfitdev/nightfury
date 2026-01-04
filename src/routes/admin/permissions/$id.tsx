import { prisma } from "@/lib/db";
import { getParams } from "@/lib/context";
import { Page } from "@/components/page";
import { Button } from "@/components/mwm-ui/button";
import { Badge } from "@/components/mwm-ui/badge";
import { Input } from "@/components/mwm-ui/input";
import { Label } from "@/components/mwm-ui/label";
import { FieldError, GlobalError } from "@/components/form-errors";
import { parseFormData, type FormState } from "@/lib/form";
import { IconKey, IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { z } from "zod";

const permissionSchema = z.object({
  resource: z
    .string()
    .min(1, "Resource is required")
    .max(50, "Resource must be 50 characters or less")
    .regex(
      /^[a-z][a-z0-9_-]*$/,
      "Resource must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores"
    ),
  action: z
    .string()
    .min(1, "Action is required")
    .max(50, "Action must be 50 characters or less")
    .regex(
      /^[a-z][a-z0-9_-]*$/,
      "Action must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores"
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;
type PermissionFormState = FormState<PermissionFormData>;

async function getPermission(id: string) {
  return prisma.permission.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        include: {
          role: true,
        },
      },
    },
  });
}

export default async function PermissionDetailPage(_req: Request) {
  const { id } = getParams();

  if (!id) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/permissions" },
    });
  }

  const permission = await getPermission(id);

  if (!permission) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/permissions" },
    });
  }

  return (
    <Page>
      <Page.Header>
        <div className="flex flex-1 items-center gap-4">
          <a href="/admin/permissions">
            <Button variant="ghost" size="icon-sm">
              <IconArrowLeft className="size-4" />
            </Button>
          </a>
          <div className="flex items-center gap-2">
            <IconKey className="size-5" />
            <h1 className="text-lg font-semibold">
              Edit Permission: {permission.displayName}
            </h1>
          </div>
        </div>
      </Page.Header>
      <Page.Content className="p-4 lg:p-6">
        <form method="post" className="max-w-2xl space-y-8">
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-base font-semibold">Permission Details</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="resource">Resource</Label>
                <Input
                  id="resource"
                  name="resource"
                  placeholder="e.g., projects"
                  defaultValue={permission.resource}
                />
                <p className="text-muted-foreground text-xs">
                  The resource this permission applies to
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  name="action"
                  placeholder="e.g., create, read, update, delete"
                  defaultValue={permission.action}
                />
                <p className="text-muted-foreground text-xs">
                  The action allowed on the resource
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                placeholder="e.g., Create Projects"
                defaultValue={permission.displayName}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Brief description of this permission"
                defaultValue={permission.description ?? ""}
              />
            </div>
          </div>

          {permission.rolePermissions.length > 0 && (
            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-base font-semibold">Used By Roles</h2>
              <div className="flex flex-wrap gap-2">
                {permission.rolePermissions.map((rp) => (
                  <Badge key={rp.id} variant="secondary">
                    {rp.role.displayName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <a href="/admin/permissions">
              <Button variant="outline">Cancel</Button>
            </a>
            <Button type="submit">
              <IconDeviceFloppy className="size-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Page.Content>
    </Page>
  );
}

export async function POST(req: Request) {
  const { id } = getParams();

  if (!id) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/permissions" },
    });
  }

  const permission = await getPermission(id);

  if (!permission) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/permissions" },
    });
  }

  const formData = await req.formData();
  const result = parseFormData(permissionSchema, formData);

  if (!result.success) {
    return (
      <Page>
        <Page.Header>
          <div className="flex flex-1 items-center gap-4">
            <a href="/admin/permissions">
              <Button variant="ghost" size="icon-sm">
                <IconArrowLeft className="size-4" />
              </Button>
            </a>
            <div className="flex items-center gap-2">
              <IconKey className="size-5" />
              <h1 className="text-lg font-semibold">
                Edit Permission: {permission.displayName}
              </h1>
            </div>
          </div>
        </Page.Header>
        <Page.Content className="p-4 lg:p-6">
          <form method="post" className="max-w-2xl space-y-8">
            <GlobalError error="Please fix the errors below" />

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-base font-semibold">Permission Details</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="resource">Resource</Label>
                  <Input
                    id="resource"
                    name="resource"
                    placeholder="e.g., projects"
                    defaultValue={
                      formData.get("resource")?.toString() ?? permission.resource
                    }
                    aria-invalid={!!result.fieldErrors.resource}
                  />
                  <FieldError errors={result.fieldErrors.resource} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="action">Action</Label>
                  <Input
                    id="action"
                    name="action"
                    placeholder="e.g., create, read, update, delete"
                    defaultValue={
                      formData.get("action")?.toString() ?? permission.action
                    }
                    aria-invalid={!!result.fieldErrors.action}
                  />
                  <FieldError errors={result.fieldErrors.action} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="e.g., Create Projects"
                  defaultValue={
                    formData.get("displayName")?.toString() ??
                    permission.displayName
                  }
                  aria-invalid={!!result.fieldErrors.displayName}
                />
                <FieldError errors={result.fieldErrors.displayName} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description of this permission"
                  defaultValue={
                    formData.get("description")?.toString() ??
                    permission.description ??
                    ""
                  }
                  aria-invalid={!!result.fieldErrors.description}
                />
                <FieldError errors={result.fieldErrors.description} />
              </div>
            </div>

            {permission.rolePermissions.length > 0 && (
              <div className="rounded-lg border p-6 space-y-4">
                <h2 className="text-base font-semibold">Used By Roles</h2>
                <div className="flex flex-wrap gap-2">
                  {permission.rolePermissions.map((rp) => (
                    <Badge key={rp.id} variant="secondary">
                      {rp.role.displayName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <a href="/admin/permissions">
                <Button variant="outline">Cancel</Button>
              </a>
              <Button type="submit">
                <IconDeviceFloppy className="size-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Page.Content>
      </Page>
    );
  }

  const newName = `${result.data.resource}:${result.data.action}`;

  // Check for duplicate name (if changed)
  if (newName !== permission.name) {
    const existingPermission = await prisma.permission.findUnique({
      where: { name: newName },
    });

    if (existingPermission) {
      return (
        <Page>
          <Page.Header>
            <div className="flex flex-1 items-center gap-4">
              <a href="/admin/permissions">
                <Button variant="ghost" size="icon-sm">
                  <IconArrowLeft className="size-4" />
                </Button>
              </a>
              <div className="flex items-center gap-2">
                <IconKey className="size-5" />
                <h1 className="text-lg font-semibold">
                  Edit Permission: {permission.displayName}
                </h1>
              </div>
            </div>
          </Page.Header>
          <Page.Content className="p-4 lg:p-6">
            <form method="post" className="max-w-2xl space-y-8">
              <GlobalError error={`Permission "${newName}" already exists`} />

              <div className="rounded-lg border p-6 space-y-4">
                <h2 className="text-base font-semibold">Permission Details</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="resource">Resource</Label>
                    <Input
                      id="resource"
                      name="resource"
                      placeholder="e.g., projects"
                      defaultValue={result.data.resource}
                      aria-invalid
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="action">Action</Label>
                    <Input
                      id="action"
                      name="action"
                      placeholder="e.g., create, read, update, delete"
                      defaultValue={result.data.action}
                      aria-invalid
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    placeholder="e.g., Create Projects"
                    defaultValue={result.data.displayName}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Brief description of this permission"
                    defaultValue={result.data.description ?? ""}
                  />
                </div>
              </div>

              {permission.rolePermissions.length > 0 && (
                <div className="rounded-lg border p-6 space-y-4">
                  <h2 className="text-base font-semibold">Used By Roles</h2>
                  <div className="flex flex-wrap gap-2">
                    {permission.rolePermissions.map((rp) => (
                      <Badge key={rp.id} variant="secondary">
                        {rp.role.displayName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <a href="/admin/permissions">
                  <Button variant="outline">Cancel</Button>
                </a>
                <Button type="submit">
                  <IconDeviceFloppy className="size-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Page.Content>
        </Page>
      );
    }
  }

  await prisma.permission.update({
    where: { id },
    data: {
      name: newName,
      resource: result.data.resource,
      action: result.data.action,
      displayName: result.data.displayName,
      description: result.data.description || null,
    },
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin/permissions" },
  });
}
