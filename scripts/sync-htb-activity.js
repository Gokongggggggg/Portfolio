const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const outputPath = path.join(rootDir, "data", "htb-solves.json");
const rawOutputPath = path.join(rootDir, "data", "htb-activity.raw.json");

loadEnv(envPath);

const token = process.env.HTB_TOKEN;
const userId = process.env.HTB_USER_ID || "2885938";
const perPage = Number(process.env.HTB_ACTIVITY_PER_PAGE || 100);
const maxPages = Number(process.env.HTB_ACTIVITY_MAX_PAGES || 5);

if (!token || token === "PASTE_YOUR_HTB_TOKEN_HERE") {
  console.error("Missing HTB_TOKEN. Copy .env.example to .env, then paste your HTB token.");
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

async function main() {
  const rawItems = await fetchAllActivity();
  const solves = rawItems.map(normalizeActivity).filter(Boolean);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(rawOutputPath, JSON.stringify(rawItems, null, 2));
  fs.writeFileSync(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: "hackthebox-activity-api",
    items: solves
  }, null, 2));

  console.log(`Synced ${solves.length} HTB activities to ${path.relative(rootDir, outputPath)}.`);
}

async function fetchAllActivity() {
  const allItems = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const url = new URL(`https://labs.hackthebox.com/api/v5/user/profile/activity/${userId}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTB request failed ${response.status}: ${body.slice(0, 240)}`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.info?.activity) ? payload.info.activity : [];
    allItems.push(...items);

    const currentPage = Number(payload?.meta?.current_page || page);
    const lastPage = Number(payload?.meta?.last_page || page);
    if (!items.length || currentPage >= lastPage) break;
  }

  return allItems;
}

function normalizeActivity(item) {
  const name = pick(item, ["name", "object_name", "machine_name", "challenge_name", "target_name", "title"]);
  if (!name) return null;

  const rawType = String(pick(item, ["type", "object_type", "content_type", "category_name"]) || "").toLowerCase();
  const type = rawType.includes("machine") ? "machine" : "challenge";
  const date = normalizeDate(pick(item, ["date", "created_at", "completed_at", "owned_at", "time"]));
  const category = pick(item, ["category", "category_name", "challenge_category", "difficulty"]) || (type === "machine" ? "Machine" : "Challenge");
  const solveType = pick(item, ["solve_type", "ownership_type", "activity_type", "action"]) || "own";
  const link = buildLink(item, type);

  return {
    date,
    type,
    solveType: String(solveType).toLowerCase(),
    name: String(name),
    category: String(category),
    lesson: "Imported from Hack The Box activity. Add a short lesson after reviewing the solve.",
    link,
    writeupUrl: "",
    tags: uniqueTags([category, type, pick(item, ["difficulty", "os", "points"])]).filter(Boolean)
  };
}

function pick(source, keys) {
  for (const key of keys) {
    if (source && source[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
  }
  return "";
}

function normalizeDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function buildLink(item, type) {
  const slug = pick(item, ["slug", "url_name"]);
  const id = pick(item, ["id", "object_id", "machine_id", "challenge_id"]);
  if (item.url) return String(item.url);
  if (type === "machine" && slug) return `https://app.hackthebox.com/machines/${slug}`;
  if (type === "challenge" && slug) return `https://app.hackthebox.com/challenges/${slug}`;
  if (id) return `https://app.hackthebox.com/${type === "machine" ? "machines" : "challenges"}/${id}`;
  return "https://app.hackthebox.com/profile/activity";
}

function uniqueTags(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}