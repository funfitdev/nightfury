import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/mwm-ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/mwm-ui/alert";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/mwm-ui/alert-dialog";
import { Button, buttonVariants } from "@/components/mwm-ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/mwm-ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/mwm-ui/popover";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/mwm-ui/sheet";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/mwm-ui/drawer";
import { AlertCircle, Terminal } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <h1 className="bg-blue-300">Home Screen</h1>
      <p>Welcome to mwm App!</p>
      <p>
        This is the root route at <code>/</code>
      </p>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Popover Demo</h2>
        <Popover>
          <PopoverTrigger className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
            Open Popover 2
          </PopoverTrigger>
          <PopoverContent sideOffset={4} align="start">
            <p className="text-sm">
              This is a native HTML popover. Click outside or press Escape to
              close.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">FAQ</h2>
        <Accordion type="single">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It uses native HTML details and summary elements which are
              fully accessible by default.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that match the other components
              and can be customized with Tailwind classes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>
              Yes. It uses CSS-only animations with the grid technique for
              smooth height transitions.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Alert Demo</h2>
        <div className="space-y-4">
          <Alert>
            <Terminal className="size-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components to your app using the cli.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Dialog Demo</h2>
        <Dialog>
          <DialogTrigger className={buttonVariants({ variant: "outline" })}>
            Open Dialog 2
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile 2</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click outside or press Escape
                to close.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">
                This dialog uses the native HTML popover API with light dismiss.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Alert Dialog Demo</h2>
        <AlertDialog>
          <AlertDialogTrigger
            className={buttonVariants({ variant: "destructive" })}
          >
            Delete Account
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Yes, delete account</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Sheet Demo</h2>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger className={buttonVariants({ variant: "outline" })}>
              Open Sheet (Right)
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Edit Profile</SheetTitle>
                <SheetDescription>
                  Make changes to your profile here. Click outside or press
                  Escape to close.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 p-4">
                <p className="text-sm text-muted-foreground">
                  This sheet uses the native HTML popover API.
                </p>
              </div>
              <SheetFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger className={buttonVariants({ variant: "outline" })}>
              Open Sheet (Left)
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Browse the menu options.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 p-4">
                <p className="text-sm text-muted-foreground">
                  Left-side sheet for navigation menus.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Drawer Demo</h2>
        <div className="flex gap-2">
          <Drawer direction="bottom">
            <DrawerTrigger className={buttonVariants({ variant: "outline" })}>
              Open Drawer (Bottom)
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Move Goal</DrawerTitle>
                <DrawerDescription>
                  Set your daily activity goal.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  This drawer uses the native HTML popover API with a drag
                  handle indicator.
                </p>
              </div>
              <DrawerFooter>
                <Button>Submit</Button>
                <DrawerClose className={buttonVariants({ variant: "outline" })}>
                  Cancel
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Drawer direction="right">
            <DrawerTrigger className={buttonVariants({ variant: "outline" })}>
              Open Drawer (Right)
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Settings</DrawerTitle>
                <DrawerDescription>Adjust your preferences.</DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 p-4">
                <p className="text-sm text-muted-foreground">
                  Right-side drawer variant.
                </p>
              </div>
              <DrawerFooter>
                <DrawerClose className={buttonVariants({ variant: "outline" })}>
                  Close
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}
