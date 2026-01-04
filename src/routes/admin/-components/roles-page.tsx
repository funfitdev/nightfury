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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/mwm-ui/dialog";
import { IconPlus, IconPencil, IconShield } from "@tabler/icons-react";
import { RoleForm, type RoleFormState } from "./role-form";
import { DeleteRoleDialog } from "./delete-role-dialog";

type Role = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  permissions: { permission: { id: string; name: string } }[];
  _count: {
    userRoles: number;
    orgRoles: number;
  };
};

interface RolesPageProps {
  roles: Role[];
  formState?: RoleFormState;
}

export function RolesPage({ roles, formState }: RolesPageProps) {
  const hasErrors = !!formState?.fieldErrors || !!formState?.globalError;

  return (
    <Page>
      <Page.Header>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <IconShield className="size-5" />
            <h1 className="text-lg font-semibold">Roles</h1>
          </div>
          <Dialog defaultOpen={hasErrors}>
            <DialogTrigger>
              <Button size="sm">
                <IconPlus className="size-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Role</DialogTitle>
                <DialogDescription>
                  Create a new role that can be assigned permissions and used by
                  organizations.
                </DialogDescription>
              </DialogHeader>
              <RoleForm formState={formState} />
            </DialogContent>
          </Dialog>
        </div>
      </Page.Header>
      <Page.Content className="p-4 lg:p-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{role.name}</code>
                      {role.isSystem && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{role.displayName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {role.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.permissions.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {role._count.userRoles} users, {role._count.orgRoles} orgs
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <a href={`/admin/roles/${role.id}`}>
                        <Button variant="ghost" size="icon-sm">
                          <IconPencil className="size-4" />
                        </Button>
                      </a>
                      <DeleteRoleDialog role={role} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No roles found. Create your first role to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Page.Content>
    </Page>
  );
}
