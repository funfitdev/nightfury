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
            Open Popover
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
            Open Dialog
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
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
    </div>
  );
}
