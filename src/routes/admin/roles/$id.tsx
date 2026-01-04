import { prisma } from "@/lib/db";
import { getParams } from "@/lib/context";
import { Page } from "@/components/page";
import { Button } from "@/components/mwm-ui/button";
import { Badge } from "@/components/mwm-ui/badge";
import { Input } from "@/components/mwm-ui/input";
import { Label } from "@/components/mwm-ui/label";
import { Checkbox } from "@/components/mwm-ui/checkbox";
import { FieldError, GlobalError } from "@/components/form-errors";
import { parseFormData, type FormState } from "@/lib/form";
import {
  IconShield,
  IconArrowLeft,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { z } from "zod";

const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .regex(
      /^[a-z][a-z0-9_-]*$/,
      "Name must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores"
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  permissions: z.array(z.string()).optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;
type RoleFormState = FormState<RoleFormData>;

async function getRole(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

async function getPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });
}

function groupPermissionsByResource(
  permissions: Awaited<ReturnType<typeof getPermissions>>
) {
  const grouped: Record<string, typeof permissions> = {};
  for (const permission of permissions) {
    const resource = permission.resource;
    if (!grouped[resource]) {
      grouped[resource] = [];
    }
    grouped[resource].push(permission);
  }
  return grouped;
}

export default async function RoleDetailPage(_req: Request) {
  const { id } = getParams();

  if (!id) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/roles" },
    });
  }

  const [role, permissions] = await Promise.all([
    getRole(id),
    getPermissions(),
  ]);

  if (!role) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/roles" },
    });
  }

  const groupedPermissions = groupPermissionsByResource(permissions);
  const assignedPermissionIds = new Set(
    role.permissions.map((rp) => rp.permissionId)
  );

  return (
    <Page>
      <Page.Header>
        <div className="flex flex-1 items-center gap-4">
          <a href="/admin/roles">
            <Button variant="ghost" size="icon-sm">
              <IconArrowLeft className="size-4" />
            </Button>
          </a>
          <div className="flex items-center gap-2">
            <IconShield className="size-5" />
            <h1 className="text-lg font-semibold">Edit Role: {role.displayName}</h1>
            {role.isSystem && <Badge variant="secondary">System</Badge>}
          </div>
        </div>
      </Page.Header>
      <Page.Content className="p-4 lg:p-6">
        <form method="post" className="max-w-4xl space-y-8">
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-base font-semibold">Role Details</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., project-manager"
                  defaultValue={role.name}
                  disabled={role.isSystem}
                />
                <p className="text-muted-foreground text-xs">
                  Lowercase letters, numbers, hyphens, and underscores only
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="e.g., Project Manager"
                  defaultValue={role.displayName}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Brief description of this role"
                defaultValue={role.description ?? ""}
              />
            </div>
          </div>

          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-base font-semibold">Permissions</h2>
            <p className="text-muted-foreground text-sm">
              Select the permissions that members with this role should have.
            </p>

            <div className="grid gap-6">
              {Object.entries(groupedPermissions).map(
                ([resource, resourcePermissions]) => (
                  <div key={resource} className="space-y-3">
                    <h3 className="text-sm font-medium capitalize">{resource}</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {resourcePermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            name="permissions"
                            value={permission.id}
                            defaultChecked={assignedPermissionIds.has(
                              permission.id
                            )}
                          />
                          <span className="text-sm">{permission.displayName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {Object.keys(groupedPermissions).length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No permissions available. Create permissions first.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <a href="/admin/roles">
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
      headers: { Location: "/admin/roles" },
    });
  }

  const role = await getRole(id);

  if (!role) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin/roles" },
    });
  }

  const formData = await req.formData();
  const result = parseFormData(roleSchema, formData);

  if (!result.success) {
    const permissions = await getPermissions();
    const groupedPermissions = groupPermissionsByResource(permissions);
    const assignedPermissionIds = new Set(
      role.permissions.map((rp) => rp.permissionId)
    );

    return (
      <Page>
        <Page.Header>
          <div className="flex flex-1 items-center gap-4">
            <a href="/admin/roles">
              <Button variant="ghost" size="icon-sm">
                <IconArrowLeft className="size-4" />
              </Button>
            </a>
            <div className="flex items-center gap-2">
              <IconShield className="size-5" />
              <h1 className="text-lg font-semibold">
                Edit Role: {role.displayName}
              </h1>
              {role.isSystem && <Badge variant="secondary">System</Badge>}
            </div>
          </div>
        </Page.Header>
        <Page.Content className="p-4 lg:p-6">
          <form method="post" className="max-w-4xl space-y-8">
            <GlobalError error="Please fix the errors below" />

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-base font-semibold">Role Details</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., project-manager"
                    defaultValue={formData.get("name")?.toString() ?? role.name}
                    disabled={role.isSystem}
                    aria-invalid={!!result.fieldErrors.name}
                  />
                  <FieldError errors={result.fieldErrors.name} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    placeholder="e.g., Project Manager"
                    defaultValue={
                      formData.get("displayName")?.toString() ?? role.displayName
                    }
                    aria-invalid={!!result.fieldErrors.displayName}
                  />
                  <FieldError errors={result.fieldErrors.displayName} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description of this role"
                  defaultValue={
                    formData.get("description")?.toString() ??
                    role.description ??
                    ""
                  }
                  aria-invalid={!!result.fieldErrors.description}
                />
                <FieldError errors={result.fieldErrors.description} />
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h2 className="text-base font-semibold">Permissions</h2>
              <p className="text-muted-foreground text-sm">
                Select the permissions that members with this role should have.
              </p>

              <div className="grid gap-6">
                {Object.entries(groupedPermissions).map(
                  ([resource, resourcePermissions]) => (
                    <div key={resource} className="space-y-3">
                      <h3 className="text-sm font-medium capitalize">
                        {resource}
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {resourcePermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              name="permissions"
                              value={permission.id}
                              defaultChecked={assignedPermissionIds.has(
                                permission.id
                              )}
                            />
                            <span className="text-sm">
                              {permission.displayName}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <a href="/admin/roles">
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

  // Check for duplicate name (if changed and not system role)
  if (!role.isSystem && result.data.name !== role.name) {
    const existingRole = await prisma.role.findUnique({
      where: { name: result.data.name },
    });

    if (existingRole) {
      const permissions = await getPermissions();
      const groupedPermissions = groupPermissionsByResource(permissions);
      const assignedPermissionIds = new Set(
        role.permissions.map((rp) => rp.permissionId)
      );

      return (
        <Page>
          <Page.Header>
            <div className="flex flex-1 items-center gap-4">
              <a href="/admin/roles">
                <Button variant="ghost" size="icon-sm">
                  <IconArrowLeft className="size-4" />
                </Button>
              </a>
              <div className="flex items-center gap-2">
                <IconShield className="size-5" />
                <h1 className="text-lg font-semibold">
                  Edit Role: {role.displayName}
                </h1>
                {role.isSystem && <Badge variant="secondary">System</Badge>}
              </div>
            </div>
          </Page.Header>
          <Page.Content className="p-4 lg:p-6">
            <form method="post" className="max-w-4xl space-y-8">
              <GlobalError error="A role with this name already exists" />

              <div className="rounded-lg border p-6 space-y-4">
                <h2 className="text-base font-semibold">Role Details</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., project-manager"
                      defaultValue={result.data.name}
                      disabled={role.isSystem}
                      aria-invalid
                    />
                    <FieldError
                      errors={["A role with this name already exists"]}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      placeholder="e.g., Project Manager"
                      defaultValue={result.data.displayName}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Brief description of this role"
                    defaultValue={result.data.description ?? ""}
                  />
                </div>
              </div>

              <div className="rounded-lg border p-6 space-y-4">
                <h2 className="text-base font-semibold">Permissions</h2>
                <p className="text-muted-foreground text-sm">
                  Select the permissions that members with this role should
                  have.
                </p>

                <div className="grid gap-6">
                  {Object.entries(groupedPermissions).map(
                    ([resource, resourcePermissions]) => (
                      <div key={resource} className="space-y-3">
                        <h3 className="text-sm font-medium capitalize">
                          {resource}
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {resourcePermissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                name="permissions"
                                value={permission.id}
                                defaultChecked={assignedPermissionIds.has(
                                  permission.id
                                )}
                              />
                              <span className="text-sm">
                                {permission.displayName}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <a href="/admin/roles">
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

  // Update role and permissions in a transaction
  const permissionIds = result.data.permissions ?? [];

  await prisma.$transaction(async (tx) => {
    // Update role details (skip name for system roles)
    await tx.role.update({
      where: { id },
      data: {
        name: role.isSystem ? undefined : result.data.name,
        displayName: result.data.displayName,
        description: result.data.description || null,
      },
    });

    // Remove all existing permissions
    await tx.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Add new permissions
    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      });
    }
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin/roles" },
  });
}
