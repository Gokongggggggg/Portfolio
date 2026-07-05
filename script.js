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
let activeSolvePage = 1;
const solvesPerPage = 8;
let htbControlsReady = false;

function renderHtbTracker() {
  const log = document.querySelector("#htb-solve-log");
  const heatmapGrid = document.querySelector("#htb-heatmap-grid");
  const heatmapMonths = document.querySelector("#htb-heatmap-months");
  const searchInput = document.querySelector("#htb-solve-search");
  const filterButtons = document.querySelectorAll("[data-solve-filter]");
  const pagination = document.querySelector("#htb-pagination");

  if (!log) return;

  initHtbControls(searchInput, filterButtons);

  const query = normalizeSearch(searchInput?.value || "");
  const sortedSolves = [...htbSolves].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredSolves = filterSolves(sortedSolves, activeSolveFilter, query);
  const machineCount = sortedSolves.filter((solve) => solve.type === "machine").length;
  const challengeCount = sortedSolves.filter((solve) => solve.type === "challenge").length;
  const writeupCount = sortedSolves.filter((solve) => Boolean(solve.writeupUrl)).length;

  renderHtbHeatmap(sortedSolves, heatmapGrid, heatmapMonths);

  const statMap = {
    total: sortedSolves.length,
    machines: machineCount,
    challenges: challengeCount,
    writeups: writeupCount
  };

  Object.entries(statMap).forEach(([key, value]) => {
    document.querySelectorAll(`[data-htb-stat="${key}"]`).forEach((node) => {
      setStatValue(node, value);
    });
  });

  if (!sortedSolves.length) {
    log.innerHTML = `<article class="solve-entry"><h4>No logged work yet</h4><p>New activity will show up here.</p></article>`;
    renderPagination(0, pagination);
    return;
  }

  if (!filteredSolves.length) {
    log.innerHTML = renderNoResults();
    renderPagination(0, pagination);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filteredSolves.length / solvesPerPage));
  activeSolvePage = Math.min(activeSolvePage, totalPages);
  const pageStart = (activeSolvePage - 1) * solvesPerPage;
  const pageSolves = filteredSolves.slice(pageStart, pageStart + solvesPerPage);

  log.innerHTML = pageSolves.map((solve) => `
    <article class="solve-entry archive-entry">
      <time datetime="${escapeAttribute(solve.date)}">${formatArchiveDate(solve.date)}</time>
      <div class="archive-entry-body">
        <div class="solve-topline">
          <div>
            <span class="solve-meta">${escapeHtml(solve.category)} / ${escapeHtml(solve.type)} / ${escapeHtml(solve.solveType)}</span>
            <h4>${escapeHtml(solve.name)}</h4>
          </div>
          <div class="solve-actions">
            ${renderWriteupBadge(solve)}
            <a class="solve-link" href="${escapeAttribute(solve.link)}" aria-label="Open ${escapeAttribute(solve.name)} log">View</a>
          </div>
        </div>
        <div class="solve-tags" aria-label="${escapeAttribute(solve.name)} tags">
          ${renderSolveTags(solve)}
        </div>
        <p>${escapeHtml(solve.lesson)}</p>
      </div>
    </article>
  `).join("");

  renderPagination(totalPages, pagination);
}

function initHtbControls(searchInput, filterButtons) {
  if (htbControlsReady) return;
  htbControlsReady = true;

  searchInput?.addEventListener("input", () => {
    activeSolvePage = 1;
    renderHtbTracker();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeSolveFilter = button.dataset.solveFilter || "all";
      activeSolvePage = 1;
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
  return `<article class="solve-entry"><h4>No matching entries</h4><p>Try another keyword, tag, category, or filter.</p></article>`;
}

function setStatValue(node, value) {
  if (!node) return;

  if (node.hasAttribute("data-count-up")) {
    animateCounter(node, Number(value) || 0);
    return;
  }

  node.textContent = value;
}

function animateCounter(node, target) {
  const current = Number(node.textContent) || 0;
  if (current === target) return;

  const duration = 650;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = Math.round(current + (target - current) * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function renderPagination(totalPages, node) {
  if (!node) return;

  if (totalPages <= 1) {
    node.innerHTML = "";
    return;
  }

  const buttons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button type="button" class="${page === activeSolvePage ? "is-active" : ""}" data-page="${page}">${page}</button>`;
  }).join("");

  node.innerHTML = `<button type="button" data-page="${Math.max(1, activeSolvePage - 1)}" ${activeSolvePage === 1 ? "disabled" : ""}>Prev</button>${buttons}<button type="button" data-page="${Math.min(totalPages, activeSolvePage + 1)}" ${activeSolvePage === totalPages ? "disabled" : ""}>Next</button>`;

  node.querySelectorAll("button[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSolvePage = Number(button.dataset.page) || 1;
      renderHtbTracker();
    });
  });
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
      const label = `${formatActivityDate(key)} - ${count} ${count === 1 ? "activity" : "activities"}`;
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

function formatArchiveDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value)).replace(",", "");
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
