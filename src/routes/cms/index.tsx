import { Page } from "@/components/page";

export default function CMSHomePage() {
  return (
    <Page>
      <Page.Header>
        <h1 className="text-2xl font-bold">MWM</h1>
      </Page.Header>
      <Page.Content>
        <div className="p-4">
          <p>Welcome to the CMS Home Page!</p>
        </div>
      </Page.Content>
    </Page>
  );
}
