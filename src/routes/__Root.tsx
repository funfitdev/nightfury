export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>NightFury App</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { box-sizing: border-box; }
              body {
                font-family: system-ui, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
                background: #f5f5f5;
              }
              nav {
                background: #333;
                padding: 1rem;
                margin-bottom: 2rem;
                border-radius: 8px;
              }
              nav a {
                color: white;
                text-decoration: none;
                margin-right: 1rem;
                padding: 0.5rem 1rem;
                border-radius: 4px;
              }
              nav a:hover { background: #555; }
              main {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 { color: #333; margin-top: 0; }
              h2 { color: #666; }
            `,
          }}
        />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/users">Users</a>
          <a href="/users/create">Create User</a>
          <a href="/users/settings">Settings</a>
          <a href="/users/payments">Payments</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
