const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = window.location.pathname.split("/").pop() || "index.html";

if (navToggle && siteNav) {
  siteNav.querySelectorAll("a").forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

let htbSolves = [
  {
    date: "2026-07-04",
    type: "challenge",
    solveType: "own",
    name: "Secure Notes",
    category: "Web",
    lesson: "Prototype pollution in Mongoose can change how backend trust checks behave.",
    link: "#",
    writeupUrl: "",
    tags: ["Web", "Mongoose", "Prototype Pollution"]
  }
];

let activeSolveFilter = "all";
let htbControlsReady = false;

function renderHtbTracker() {
  const feed = document.querySelector("#htb-activity-feed");
  const log = document.querySelector("#htb-solve-log");
  const heatmapGrid = document.querySelector("#htb-heatmap-grid");
  const heatmapMonths = document.querySelector("#htb-heatmap-months");
  const searchInput = document.querySelector("#htb-solve-search");
  const filterButtons = document.querySelectorAll("[data-solve-filter]");

  if (!feed || !log) return;

  initHtbControls(searchInput, filterButtons);

  const query = normalizeSearch(searchInput?.value || "");
  const sortedSolves = [...htbSolves].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredSolves = filterSolves(sortedSolves, activeSolveFilter, query);
  const machineCount = sortedSolves.filter((solve) => solve.type === "machine").length;
  const challengeCount = sortedSolves.filter((solve) => solve.type === "challenge").length;
  const latestSolve = sortedSolves[0];

  renderHtbHeatmap(sortedSolves, heatmapGrid, heatmapMonths);

  const statMap = {
    total: sortedSolves.length,
    machines: machineCount,
    challenges: challengeCount,
    latest: latestSolve ? latestSolve.name : "-"
  };

  Object.entries(statMap).forEach(([key, value]) => {
    const node = document.querySelector(`[data-htb-stat="${key}"]`);
    if (node) node.textContent = value;
  });

  if (!sortedSolves.length) {
    feed.innerHTML = `<article class="activity-item"><span class="activity-dot" aria-hidden="true"></span><div><h4>No logged solves yet</h4><p>New HTB solves will show up here.</p></div></article>`;
    log.innerHTML = `<article class="solve-entry"><h4>No solve notes yet</h4><p>Once a challenge or machine is logged, the lesson summary will appear here.</p></article>`;
    return;
  }

  if (!filteredSolves.length) {
    feed.innerHTML = renderNoResults();
    log.innerHTML = renderNoResults();
    return;
  }

  feed.innerHTML = filteredSolves.slice(0, 4).map((solve) => `
    <article class="activity-item">
      <span class="activity-dot" aria-hidden="true"></span>
      <div>
        <h4>${escapeHtml(solve.name)}</h4>
        <p>${escapeHtml(solve.category)} / ${escapeHtml(solve.type)} / ${escapeHtml(solve.solveType)}</p>
        <span class="activity-meta">${formatActivityDate(solve.date)}</span>
      </div>
    </article>
  `).join("");

  log.innerHTML = filteredSolves.map((solve) => `
    <article class="solve-entry">
      <div class="solve-topline">
        <div>
          <span class="solve-meta">${formatActivityDate(solve.date)} / ${escapeHtml(solve.type)}</span>
          <h4>${escapeHtml(solve.name)}</h4>
        </div>
        <div class="solve-actions">
          ${renderWriteupBadge(solve)}
          <a class="solve-link" href="${escapeAttribute(solve.link)}" aria-label="Open ${escapeAttribute(solve.name)} log">View</a>
        </div>
      </div>
      <p>${escapeHtml(solve.lesson)}</p>
      <div class="solve-tags" aria-label="${escapeAttribute(solve.name)} tags">
        ${renderSolveTags(solve)}
      </div>
    </article>
  `).join("");
}

function initHtbControls(searchInput, filterButtons) {
  if (htbControlsReady) return;
  htbControlsReady = true;

  searchInput?.addEventListener("input", renderHtbTracker);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeSolveFilter = button.dataset.solveFilter || "all";
      filterButtons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      renderHtbTracker();
    });
  });
}

function filterSolves(solves, typeFilter, query) {
  return solves.filter((solve) => {
    const matchesType = typeFilter === "all" || solve.type === typeFilter;
    if (!matchesType) return false;
    if (!query) return true;

    const searchable = [
      solve.name,
      solve.type,
      solve.solveType,
      solve.category,
      solve.lesson,
      ...(solve.tags || [])
    ].map(normalizeSearch).join(" ");

    return searchable.includes(query);
  });
}

function renderNoResults() {
  return `<article class="solve-entry"><h4>No matching solves</h4><p>Try another keyword, tag, category, or filter.</p></article>`;
}

function renderSolveTags(solve) {
  const writeupTag = solve.writeupUrl ? "WU" : "No WU";
  return [writeupTag, ...(solve.tags || [])].map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function renderWriteupBadge(solve) {
  if (solve.writeupUrl) {
    return `<a class="writeup-badge has-writeup" href="${escapeAttribute(solve.writeupUrl)}" aria-label="Open ${escapeAttribute(solve.name)} writeup">WU</a>`;
  }

  return `<span class="writeup-badge no-writeup">No WU</span>`;
}

function renderHtbHeatmap(solves, grid, months) {
  if (!grid || !months) return;

  const endDate = startOfDay(new Date());
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 364);

  const solvesByDay = new Map();
  solves.forEach((solve) => {
    const key = toDateKey(new Date(solve.date));
    solvesByDay.set(key, (solvesByDay.get(key) || 0) + 1);
  });

  const days = [];
  for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day));
  }

  const leadingBlanks = days[0].getDay();
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => `<span class="heatmap-cell is-empty" aria-hidden="true"></span>`),
    ...days.map((day) => {
      const key = toDateKey(day);
      const count = solvesByDay.get(key) || 0;
      const level = heatmapLevel(count);
      const label = `${formatActivityDate(key)} - ${count} ${count === 1 ? "solve" : "solves"}`;
      return `<span class="heatmap-cell" data-level="${level}" title="${label}" aria-label="${label}"></span>`;
    })
  ];

  grid.innerHTML = cells.join("");
  months.innerHTML = buildHeatmapMonthLabels(days, leadingBlanks);
}

function buildHeatmapMonthLabels(days, leadingBlanks) {
  const labels = [];
  let lastMonth = "";

  days.forEach((day, index) => {
    const month = day.toLocaleString("en", { month: "short" });
    if (month !== lastMonth) {
      labels.push(`<span style="grid-column: ${Math.floor((index + leadingBlanks) / 7) + 1};">${month}</span>`);
      lastMonth = month;
    }
  });

  return labels.join("");
}

function heatmapLevel(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function formatActivityDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function normalizeSearch(value) {
  return String(value || "").toLowerCase().trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

loadHtbSolves().then(renderHtbTracker);

async function loadHtbSolves() {
  const tracker = document.querySelector("#htb-solve-log");
  if (!tracker) return;

  try {
    const response = await fetch("data/htb-solves.json", { cache: "no-store" });
    if (!response.ok) throw new Error("HTB solves JSON not available");

    const payload = await response.json();
    if (Array.isArray(payload?.items)) {
      htbSolves = payload.items;
    }
  } catch (error) {
    // Keep the manual fallback data when the generated JSON is unavailable locally.
  }
}
