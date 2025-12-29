import { renderToReadableStream } from "react-dom/server";

function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>React SSR with HTMX</title>
        <script src="https://unpkg.com/htmx.org@2.0.4"></script>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
              button { padding: 0.5rem 1rem; margin: 0.5rem; cursor: pointer; }
              .htmx-indicator { display: none; }
              .htmx-request .htmx-indicator { display: inline; }
              #result { padding: 1rem; margin-top: 1rem; border: 1px solid #ccc; border-radius: 4px; min-height: 50px; }
            `,
          }}
        />
      </head>
      <body>
        <div id="root">
          <h1>Hello from React SSR with HTMX!</h1>
          <p>This page was server-side rendered.</p>

          <h2>HTMX Examples</h2>

          {/* Example 1: Simple GET request */}
          <section>
            <h3>1. Click to Load (GET)</h3>
            <button hx-get="/api/htmx/greeting" hx-target="#greeting-result">
              Load Greeting <span className="htmx-indicator">⏳</span>
            </button>
            <div id="greeting-result"></div>
          </section>

          {/* Example 2: POST with form data */}
          <section>
            <h3>2. Form Submission (POST)</h3>
            <form hx-post="/api/htmx/echo" hx-target="#echo-result">
              <input type="text" name="message" placeholder="Enter a message" />
              <button type="submit">
                Send <span className="htmx-indicator">⏳</span>
              </button>
            </form>
            <div id="echo-result"></div>
          </section>

          {/* Example 3: Polling */}
          <section>
            <h3>3. Live Time (Polling every 2s)</h3>
            <div hx-get="/api/htmx/time" hx-trigger="load, every 2s">
              Loading time...
            </div>
          </section>

          {/* Example 4: Delete with confirmation */}
          <section>
            <h3>4. Delete with Swap</h3>
            <div id="delete-demo">
              <span>Item to delete</span>
              <button
                hx-delete="/api/htmx/item"
                hx-target="#delete-demo"
                hx-swap="outerHTML"
                hx-confirm="Are you sure?"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      </body>
    </html>
  );
}

async function reactSSRHandler(_req: Request): Promise<Response> {
  const stream = await renderToReadableStream(<App />);
  return new Response(stream, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

const server = Bun.serve({
  routes: {
    // ...existing routes...
    "/api/status": new Response("OK"),
    "/users/:id": (req) => {
      return new Response(`Hello User ${req.params.id}!`);
    },
    "/api/posts": {
      GET: () => new Response("List posts"),
      POST: async (req) => {
        const body = await req.json();
        const data = typeof body === "object" && body !== null ? body : {};
        return Response.json({ created: true, ...data });
      },
    },
    // HTMX API endpoints
    "/api/htmx/greeting": () =>
      new Response("<p><strong>Hello!</strong> Greetings from the server.</p>", {
        headers: { "Content-Type": "text/html" },
      }),
    "/api/htmx/echo": {
      POST: async (req) => {
        const formData = await req.formData();
        const message = formData.get("message") || "No message";
        return new Response(`<p>You said: <em>${message}</em></p>`, {
          headers: { "Content-Type": "text/html" },
        });
      },
    },
    "/api/htmx/time": () =>
      new Response(`<p>Server time: <strong>${new Date().toLocaleTimeString()}</strong></p>`, {
        headers: { "Content-Type": "text/html" },
      }),
    "/api/htmx/item": {
      DELETE: () =>
        new Response("<p><em>Item deleted successfully!</em></p>", {
          headers: { "Content-Type": "text/html" },
        }),
    },
    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
    "/blog/hello": Response.redirect("/blog/hello/world"),
    "/favicon.ico": Bun.file("./favicon.ico"),
    // New SSR route
    "/ssr": reactSSRHandler,
  },
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at ${server.url}`);
