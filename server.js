const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { execFile } = require("child_process");

const root = __dirname;
const port = Number(process.env.PORT || 8787);
const host = "127.0.0.1";

const dataFiles = {
  events: path.join(root, "data", "events.json"),
  menu: path.join(root, "data", "menu.json"),
  site: path.join(root, "data", "site.json"),
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const sendJson = (response, status, payload) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
};

const readBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        request.destroy(new Error("Request body is too large."));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const readData = async () => {
  const entries = await Promise.all(
    Object.entries(dataFiles).map(async ([key, file]) => [key, JSON.parse(await fs.readFile(file, "utf8"))]),
  );
  return Object.fromEntries(entries);
};

const writeData = async (payload) => {
  await Promise.all(
    Object.entries(dataFiles).map(async ([key, file]) => {
      if (!payload[key]) {
        throw new Error(`Missing ${key} data.`);
      }
      await fs.writeFile(file, `${JSON.stringify(payload[key], null, 2)}\n`, "utf8");
    }),
  );
};

const runGit = (args) =>
  new Promise((resolve, reject) => {
    execFile("git", args, { cwd: root, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${stderr || stdout || error.message}`.trim()));
        return;
      }
      resolve(`${stdout}${stderr}`.trim());
    });
  });

const publish = async () => {
  await runGit(["add", "data/events.json", "data/menu.json", "data/site.json"]);

  try {
    await runGit(["diff", "--cached", "--quiet"]);
    return "No data changes to publish.";
  } catch {
    await runGit(["commit", "-m", "Update site data"]);
  }

  const output = await runGit(["push", "origin", "master"]);
  return `Published to GitHub Pages. ${output}`;
};

const serveFile = async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
  const filePath = path.normalize(path.join(root, decodedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === "/api/data" && request.method === "GET") {
      sendJson(response, 200, { ok: true, ...(await readData()) });
      return;
    }

    if (request.url === "/api/save" && request.method === "POST") {
      await writeData(JSON.parse(await readBody(request)));
      sendJson(response, 200, { ok: true, message: "Saved local JSON data." });
      return;
    }

    if (request.url === "/api/publish" && request.method === "POST") {
      sendJson(response, 200, { ok: true, message: await publish() });
      return;
    }

    await serveFile(request, response);
  } catch (error) {
    sendJson(response, 500, { ok: false, error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`IPPIN Maintenance Panel: http://${host}:${port}/admin.html`);
});
