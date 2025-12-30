import css from "../styles/output.css" with { type: "text" };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>NightFury App</title>
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body className="bg-gray-100 font-sans max-w-5xl mx-auto p-8">
        <nav className="bg-gray-800 p-4 mb-8 rounded-lg flex gap-2">
          <a href="/" className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600">Home</a>
          <a href="/users" className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600">Users</a>
          <a href="/users/create" className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600">Create User</a>
          <a href="/users/settings" className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600">Settings</a>
          <a href="/users/payments" className="text-white no-underline px-4 py-2 rounded hover:bg-gray-600">Payments</a>
        </nav>
        <main className="bg-white p-8 rounded-lg shadow">
          {children}
        </main>
      </body>
    </html>
  );
}
