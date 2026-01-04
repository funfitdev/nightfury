import { prisma } from "@/lib/db";
import { Page } from "@/components/page";
import { Button } from "@/components/mwm-ui/button";
import { Badge } from "@/components/mwm-ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/mwm-ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/mwm-ui/dialog";
import { Input } from "@/components/mwm-ui/input";
import { Label } from "@/components/mwm-ui/label";
import { FieldError, GlobalError } from "@/components/form-errors";
import { parseFormData, type FormState } from "@/lib/form";
import { IconPlus, IconPencil, IconTrash, IconKey } from "@tabler/icons-react";
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

async function getPermissions() {
  return prisma.permission.findMany({
    include: {
      _count: {
        select: {
          rolePermissions: true,
        },
      },
    },
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });
}

function PermissionForm({
  formState,
  permission,
}: {
  formState?: PermissionFormState;
  permission?: {
    id: string;
    resource: string;
    action: string;
    displayName: string;
    description: string | null;
  };
}) {
  const isEdit = !!permission;

  return (
    <form
      method="post"
      action={isEdit ? `/admin/permissions/${permission.id}` : "/admin/permissions"}
      className="grid gap-4"
    >
      <GlobalError error={formState?.globalError} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="resource">Resource</Label>
          <Input
            id="resource"
            name="resource"
            placeholder="e.g., projects"
            defaultValue={formState?.values?.resource ?? permission?.resource ?? ""}
            aria-invalid={!!formState?.fieldErrors?.resource}
          />
          <p className="text-muted-foreground text-xs">
            The resource this permission applies to
          </p>
          <FieldError errors={formState?.fieldErrors?.resource} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="action">Action</Label>
          <Input
            id="action"
            name="action"
            placeholder="e.g., create, read, update, delete"
            defaultValue={formState?.values?.action ?? permission?.action ?? ""}
            aria-invalid={!!formState?.fieldErrors?.action}
          />
          <p className="text-muted-foreground text-xs">
            The action allowed on the resource
          </p>
          <FieldError errors={formState?.fieldErrors?.action} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          name="displayName"
          placeholder="e.g., Create Projects"
          defaultValue={formState?.values?.displayName ?? permission?.displayName ?? ""}
          aria-invalid={!!formState?.fieldErrors?.displayName}
        />
        <FieldError errors={formState?.fieldErrors?.displayName} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Brief description of this permission"
          defaultValue={formState?.values?.description ?? permission?.description ?? ""}
          aria-invalid={!!formState?.fieldErrors?.description}
        />
        <FieldError errors={formState?.fieldErrors?.description} />
      </div>

      <DialogFooter>
        <DialogClose>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">{isEdit ? "Update Permission" : "Create Permission"}</Button>
      </DialogFooter>
    </form>
  );
}

function DeletePermissionDialog({
  permission,
}: {
  permission: { id: string; name: string };
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon-sm">
          <IconTrash className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Permission</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the permission "{permission.name}"?
            This will remove it from all roles. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <form method="post" action={`/admin/permissions/${permission.id}/delete`}>
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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

export default async function PermissionsPage(_req: Request) {
  const permissions = await getPermissions();
  const groupedPermissions = groupPermissionsByResource(permissions);

  return (
    <Page>
      <Page.Header>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <IconKey className="size-5" />
            <h1 className="text-lg font-semibold">Permissions</h1>
          </div>
          <Dialog>
            <DialogTrigger>
              <Button size="sm">
                <IconPlus className="size-4" />
                Create Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Permission</DialogTitle>
                <DialogDescription>
                  Create a new permission that can be assigned to roles.
                </DialogDescription>
              </DialogHeader>
              <PermissionForm />
            </DialogContent>
          </Dialog>
        </div>
      </Page.Header>
      <Page.Content className="p-4 lg:p-6">
        {Object.keys(groupedPermissions).length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">
              No permissions found. Create your first permission to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(
              ([resource, resourcePermissions]) => (
                <div key={resource} className="rounded-lg border">
                  <div className="border-b bg-muted/50 px-4 py-3">
                    <h2 className="text-sm font-semibold capitalize">{resource}</h2>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourcePermissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <code className="text-sm">{permission.name}</code>
                          </TableCell>
                          <TableCell>{permission.displayName}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {permission.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {permission._count.rolePermissions} roles
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <a href={`/admin/permissions/${permission.id}`}>
                                <Button variant="ghost" size="icon-sm">
                                  <IconPencil className="size-4" />
                                </Button>
                              </a>
                              <DeletePermissionDialog permission={permission} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            )}
          </div>
        )}
      </Page.Content>
    </Page>
  );
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const result = parseFormData(permissionSchema, formData);

  if (!result.success) {
    const permissions = await getPermissions();
    const groupedPermissions = groupPermissionsByResource(permissions);

    return (
      <Page>
        <Page.Header>
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <IconKey className="size-5" />
              <h1 className="text-lg font-semibold">Permissions</h1>
            </div>
            <Dialog>
              <DialogTrigger>
                <Button size="sm">
                  <IconPlus className="size-4" />
                  Create Permission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Permission</DialogTitle>
                  <DialogDescription>
                    Create a new permission that can be assigned to roles.
                  </DialogDescription>
                </DialogHeader>
                <PermissionForm
                  formState={{
                    values: Object.fromEntries(formData) as Partial<PermissionFormData>,
                    fieldErrors: result.fieldErrors,
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </Page.Header>
        <Page.Content className="p-4 lg:p-6">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(
              ([resource, resourcePermissions]) => (
                <div key={resource} className="rounded-lg border">
                  <div className="border-b bg-muted/50 px-4 py-3">
                    <h2 className="text-sm font-semibold capitalize">{resource}</h2>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourcePermissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <code className="text-sm">{permission.name}</code>
                          </TableCell>
                          <TableCell>{permission.displayName}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {permission.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {permission._count.rolePermissions} roles
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <a href={`/admin/permissions/${permission.id}`}>
                                <Button variant="ghost" size="icon-sm">
                                  <IconPencil className="size-4" />
                                </Button>
                              </a>
                              <DeletePermissionDialog permission={permission} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            )}
          </div>
        </Page.Content>
      </Page>
    );
  }

  const name = `${result.data.resource}:${result.data.action}`;

  // Check if permission already exists
  const existingPermission = await prisma.permission.findUnique({
    where: { name },
  });

  if (existingPermission) {
    const permissions = await getPermissions();
    const groupedPermissions = groupPermissionsByResource(permissions);

    return (
      <Page>
        <Page.Header>
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <IconKey className="size-5" />
              <h1 className="text-lg font-semibold">Permissions</h1>
            </div>
            <Dialog>
              <DialogTrigger>
                <Button size="sm">
                  <IconPlus className="size-4" />
                  Create Permission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Permission</DialogTitle>
                  <DialogDescription>
                    Create a new permission that can be assigned to roles.
                  </DialogDescription>
                </DialogHeader>
                <PermissionForm
                  formState={{
                    values: result.data,
                    globalError: `Permission "${name}" already exists`,
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </Page.Header>
        <Page.Content className="p-4 lg:p-6">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(
              ([resource, resourcePermissions]) => (
                <div key={resource} className="rounded-lg border">
                  <div className="border-b bg-muted/50 px-4 py-3">
                    <h2 className="text-sm font-semibold capitalize">{resource}</h2>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourcePermissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <code className="text-sm">{permission.name}</code>
                          </TableCell>
                          <TableCell>{permission.displayName}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {permission.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {permission._count.rolePermissions} roles
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <a href={`/admin/permissions/${permission.id}`}>
                                <Button variant="ghost" size="icon-sm">
                                  <IconPencil className="size-4" />
                                </Button>
                              </a>
                              <DeletePermissionDialog permission={permission} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            )}
          </div>
        </Page.Content>
      </Page>
    );
  }

  await prisma.permission.create({
    data: {
      name,
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
