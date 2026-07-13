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
const maxPages = Number(process.env.HTB_ACTIVITY_MAX_PAGES || 10);

if (!token || token === "PASTE_YOUR_HTB_TOKEN_HERE") {
  console.error("Missing HTB_TOKEN. Copy .env.example to .env, then paste your HTB token.");
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

async function main() {
  const existingArchive = readExistingArchive();
  const existingItems = existingArchive.items;
  const rawItems = await fetchAllActivity();
  if (!rawItems.length) {
    throw new Error("HTB returned no activity. Refusing to replace the existing archive.");
  }

  const remoteSolves = dedupeSolves(rawItems.map(normalizeActivity).filter(Boolean));
  const solves = mergeWithExisting(remoteSolves, existingItems);
  const itemsChanged = JSON.stringify(solves) !== JSON.stringify(existingItems);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(rawOutputPath, JSON.stringify(rawItems, null, 2));
  fs.writeFileSync(outputPath, JSON.stringify({
    generatedAt: itemsChanged ? new Date().toISOString() : existingArchive.generatedAt || new Date().toISOString(),
    source: "hackthebox-activity-api-v5",
    items: solves
  }, null, 2));

  console.log(`Fetched ${rawItems.length} HTB activities across the available history pages.`);
  console.log(`Wrote ${solves.length} archive entries, including preserved manual writeups.`);
  if (!itemsChanged) console.log("No archive item changes were detected.");
}

async function fetchAllActivity() {
  const allItems = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const url = new URL(`https://labs.hackthebox.com/api/v5/user/profile/activity/${userId}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));

    const response = await fetchWithRetry(url);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTB request failed ${response.status}: ${body.slice(0, 240)}`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.info?.activity) ? payload.info.activity : [];
    allItems.push(...items);

    const meta = payload?.meta || {};
    const currentPage = Number(meta.current_page ?? meta.currentPage ?? meta.page ?? page);
    const totalItems = Number(meta.total ?? meta.totalItems ?? 0);
    const inferredLastPage = totalItems && items.length ? Math.ceil(totalItems / items.length) : page;
    const lastPage = Number(meta.last_page ?? meta.lastPage ?? inferredLastPage);
    if (!items.length || currentPage >= lastPage) break;
  }

  return allItems;
}

async function fetchWithRetry(url, attempts = 3) {
  let lastResponse;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastResponse = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    if (lastResponse.ok || ![404, 429, 500, 502, 503, 504].includes(lastResponse.status) || attempt === attempts) {
      return lastResponse;
    }

    await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
  }

  return lastResponse;
}

function normalizeActivity(item) {
  const name = pick(item, ["name", "object_name", "machine_name", "challenge_name", "target_name", "title"]);
  if (!name) return null;

  const rawType = String(pick(item, ["type", "object_type", "content_type", "category_name"]) || "").toLowerCase();
  const type = rawType.includes("machine") || rawType === "user" || rawType === "root" ? "machine" : "challenge";
  const date = normalizeDate(pick(item, ["ownDate", "date", "created_at", "completed_at", "owned_at", "time"]));
  const category = pick(item, ["categoryName", "category", "category_name", "challenge_category", "difficulty"]) || (type === "machine" ? "Machine" : "Challenge");
  const solveType = type === "machine" && (rawType === "user" || rawType === "root") ? rawType : "own";
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
    tags: uniqueTags([category, type, pick(item, ["difficulty", "os"])]).filter(Boolean)
  };
}


function dedupeSolves(solves) {
  const priority = { root: 3, own: 2, user: 1 };
  const byKey = new Map();

  for (const solve of solves) {
    const key = `${solve.type}:${solve.link || solve.name}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, solve);
      continue;
    }

    const currentPriority = priority[solve.solveType] || 0;
    const existingPriority = priority[existing.solveType] || 0;
    if (currentPriority > existingPriority || new Date(solve.date) > new Date(existing.date)) {
      byKey.set(key, solve);
    }
  }

  return [...byKey.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
}
function pick(source, keys) {
  for (const key of keys) {
    if (source && source[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
  }
  return "";
}

function mergeWithExisting(remoteSolves, existingItems) {
  const existingRemoteByKey = new Map();
  const existingRemoteByName = new Map();
  const manualItems = [];

  for (const item of existingItems) {
    if (isManualItem(item)) {
      manualItems.push(item);
      continue;
    }

    existingRemoteByKey.set(solveKey(item), item);
    existingRemoteByName.set(`${item.type}:${String(item.name).toLowerCase()}`, item);
  }

  const mergedRemote = remoteSolves.map((solve) => {
    const existing = existingRemoteByKey.get(solveKey(solve))
      || existingRemoteByName.get(`${solve.type}:${solve.name.toLowerCase()}`);
    if (!existing) return solve;

    return {
      ...solve,
      category: isGenericCategory(existing.category) ? solve.category : existing.category,
      lesson: isImportedLesson(existing.lesson) ? solve.lesson : existing.lesson,
      writeupUrl: existing.writeupUrl || solve.writeupUrl,
      tags: uniqueTags([...(solve.tags || []), ...(existing.tags || [])])
    };
  });

  return dedupeSolves([...manualItems, ...mergedRemote]);
}

function readExistingArchive() {
  if (!fs.existsSync(outputPath)) return { generatedAt: "", items: [] };

  try {
    const payload = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    return {
      generatedAt: String(payload?.generatedAt || ""),
      items: Array.isArray(payload?.items) ? payload.items : []
    };
  } catch (error) {
    throw new Error(`Could not read the existing archive: ${error.message}`);
  }
}

function isManualItem(item) {
  const link = String(item?.link || "");
  return item?.solveType === "ctf"
    || Boolean(item?.writeupUrl)
    || (link && !/^https?:\/\//i.test(link));
}

function solveKey(solve) {
  return `${solve.type}:${solve.link || String(solve.name).toLowerCase()}`;
}

function isImportedLesson(lesson) {
  return !lesson || String(lesson).startsWith("Imported from Hack The Box activity.");
}

function isGenericCategory(category) {
  return !category || ["challenge", "machine"].includes(String(category).toLowerCase());
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
