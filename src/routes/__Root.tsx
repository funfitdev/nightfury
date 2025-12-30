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
        <script src="/bundle.js" />
        {isDev && (
          <script dangerouslySetInnerHTML={{ __html: liveReloadScript }} />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
