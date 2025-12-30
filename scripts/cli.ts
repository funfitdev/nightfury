import { Glob, $ } from "bun";
import { watch } from "fs";
import { resolve } from "path";

const projectRoot = resolve(import.meta.dir, "..");

// Generate routes
async function generateRoutes() {
  const glob = new Glob("**/*.tsx");
  const routesDir = import.meta.dir + "/../src/routes";

  const routes: { path: string; importPath: string }[] = [];

  for await (const file of glob.scan(routesDir)) {
    if (file.startsWith("__")) continue;

    let route = file.replace(/\.tsx$/, "");

    if (route === "index") {
      route = "/";
    } else if (route.endsWith("/index")) {
      route = "/" + route.replace(/\/index$/, "");
    } else {
      route = "/" + route.replace(/\./g, "/");
    }

    routes.push({
      path: route,
      importPath: `./routes/${file.replace(/\.tsx$/, "")}`,
    });
  }

  routes.sort((a, b) => a.path.localeCompare(b.path));

  const imports = routes
    .map((r, i) => `import Route${i} from "${r.importPath}";`)
    .join("\n");
  const routeEntries = routes
    .map((r, i) => `  "${r.path}": createSSRHandler(Route${i}),`)
    .join("\n");

  const content = `// Auto-generated - do not edit
import { renderToReadableStream } from "react-dom/server";
import Root from "./routes/__Root";
${imports}

function createSSRHandler(Component: React.ComponentType) {
  return async (_req: Request): Promise<Response> => {
    const stream = await renderToReadableStream(
      <Root>
        <Component />
      </Root>
    );
    return new Response(stream, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  };
}

export const routes: Record<string, (req: Request) => Promise<Response>> = {
${routeEntries}
};

export async function handleUIRoutes(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const handler = routes[url.pathname];
  return handler ? handler(req) : null;
}
`;

  await Bun.write(import.meta.dir + "/../src/routes.generated.tsx", content);
  console.log(`✓ Generated ${routes.length} routes`);
}

// Build Tailwind CSS
function buildCSS(watchMode = false) {
  const args = [
    "bun",
    "tailwindcss",
    "-i",
    "src/styles/main.css",
    "-o",
    "public/styles.css",
  ];
  if (!watchMode) args.push("--minify");
  if (watchMode) args.push("--watch=always");

  return Bun.spawn(args, {
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });
}

// Dev mode
async function dev() {
  console.log("🚀 Starting development server...\n");

  await generateRoutes();

  const routesDir = import.meta.dir + "/../src/routes";
  const watcher = watch(
    routesDir,
    { recursive: true },
    async (_event, filename) => {
      if (filename?.endsWith(".tsx") && !filename.startsWith("__")) {
        console.log(`\n📁 Route changed: ${filename}`);
        await generateRoutes();
      }
    }
  );

  console.log("🎨 Starting Tailwind CSS...");
  const tailwind = buildCSS(true);

  await Bun.sleep(500);

  console.log("🔥 Starting Bun server with hot reload...\n");
  const server = Bun.spawn(["bun", "--hot", "./index.tsx"], {
    cwd: projectRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down...");
    watcher.close();
    tailwind.kill();
    server.kill();
    process.exit(0);
  });

  await server.exited;
}

// Build mode
async function build() {
  console.log("📦 Building for production...\n");

  await generateRoutes();

  const tailwind = buildCSS(false);
  await tailwind.exited;
  console.log("✓ Built CSS");

  await $`cd ${projectRoot} && bun build ./index.tsx --compile --outfile=dist/server`;
  console.log("✓ Compiled server binary");

  console.log("\n✅ Build complete! Run with: ./dist/server");
}

// CLI
const command = process.argv[2];

switch (command) {
  case "dev":
    dev();
    break;
  case "build":
    build();
    break;
  default:
    console.log("Usage: bun scripts/cli.ts <dev|build>");
    process.exit(1);
}
