import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function HomePage() {
  return (
    <div>
      <h1 className="bg-blue-300">Home Screen</h1>
      <p>Welcome to mwm App!</p>
      <p>
        This is the root route at <code>/</code>
      </p>

      <div className="mt-8 max-w-md">
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
    </div>
  );
}
