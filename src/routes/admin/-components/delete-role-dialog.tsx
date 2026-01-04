import { Button } from "@/components/mwm-ui/button";
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
import { IconTrash } from "@tabler/icons-react";

export function DeleteRoleDialog({ role }: { role: { id: string; name: string; isSystem: boolean } }) {
  if (role.isSystem) return null;

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon-sm">
          <IconTrash className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <form method="post" action={`/admin/roles/${role.id}/delete`}>
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
