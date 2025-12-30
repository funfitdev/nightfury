const isDev = process.env.NODE_ENV !== "production";

const liveReloadScript = `
  (function() {
    const ws = new WebSocket("ws://" + location.host + "/__reload");
    ws.onmessage = (e) => { if (e.data === "reload") location.reload(); };
    ws.onclose = () => setTimeout(() => location.reload(), 1000);
  })();
`;

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>mwm App</title>
        <link rel="stylesheet" href="/styles.css" />
        {isDev && (
          <script dangerouslySetInnerHTML={{ __html: liveReloadScript }} />
        )}
      </head>
      <body className="bg-gray-100 font-sans max-w-5xl mx-auto p-8">
        <nav className="bg-gray-800 p-4 mb-8 rounded-lg flex gap-2">
          <a
            href="/"
            className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600"
          >
            Home
          </a>
          <a
            href="/users"
            className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600"
          >
            Users
          </a>
          <a
            href="/users/create"
            className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600"
          >
            Create User
          </a>
          <a
            href="/users/settings"
            className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600"
          >
            Settings
          </a>
          <a
            href="/users/payments"
            className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600"
          >
            Payments
          </a>
        </nav>
        <main className="bg-white p-8 rounded-lg shadow">{children}</main>
      </body>
    </html>
  );
}
