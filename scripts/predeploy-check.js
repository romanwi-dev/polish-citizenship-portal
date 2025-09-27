import { spawn } from "child_process";
import http from "http";

const PORT = process.env.PORT || 3000;
const START_CMD = "node dist/index.js";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkHealth() {
  return new Promise((resolve) => {
    http.get({ hostname: "127.0.0.1", port: PORT, path: "/healthz", timeout: 2000 }, (res) => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false));
  });
}

async function run() {
  console.log("== PREDEPLOY SIMULATION START ==");

  // 1) Build the app
  console.log("Building app...");
  const build = spawn("npm", ["run", "build"], { stdio: "inherit", shell: true });
  await new Promise((resolve, reject) => {
    build.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("Build failed"))));
  });

  // 2) Start the server
  console.log(`Starting app on port ${PORT}...`);
  const server = spawn(START_CMD, { stdio: "pipe", shell: true, env: { ...process.env, PORT } });

  server.stdout.on("data", (d) => process.stdout.write(`[app] ${d}`));
  server.stderr.on("data", (d) => process.stderr.write(`[err] ${d}`));

  // 3) Give it some time to boot
  let healthy = false;
  for (let i = 0; i < 10; i++) {
    await wait(2000);
    healthy = await checkHealth();
    if (healthy) break;
  }

  if (healthy) {
    console.log("✅ PREDEPLOY CHECK PASSED — app booted and /healthz responded 200");
    server.kill();
    process.exit(0);
  } else {
    console.error("❌ PREDEPLOY CHECK FAILED — app never responded at /healthz");
    server.kill();
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Predeploy script error:", err);
  process.exit(1);
});