const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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
const counterAnimations = new WeakMap();

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
  registerRevealTargets(log.querySelectorAll(".archive-entry"));
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

  const previousFrame = counterAnimations.get(node);
  if (previousFrame) cancelAnimationFrame(previousFrame);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    node.textContent = target;
    return;
  }

  const duration = 1150 + Math.min(target * 14, 420);
  const start = performance.now();
  node.classList.add("is-counting");

  if (typeof node.animate === "function") {
    node.animate([
      { opacity: 0.55, transform: "translateY(9px) scale(0.98)", filter: "blur(1px)" },
      { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" }
    ], {
      duration: 520,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    });
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    node.textContent = Math.round(current + (target - current) * eased);

    if (progress < 1) {
      counterAnimations.set(node, requestAnimationFrame(tick));
      return;
    }

    node.textContent = target;
    node.classList.remove("is-counting");
    counterAnimations.delete(node);
  }

  counterAnimations.set(node, requestAnimationFrame(tick));
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
  const totalColumns = Math.ceil((leadingBlanks + days.length) / 7);
  const trailingBlanks = totalColumns * 7 - leadingBlanks - days.length;
  const blankCell = `<span class="heatmap-cell is-empty" aria-hidden="true"></span>`;
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => blankCell),
    ...days.map((day) => {
      const key = toDateKey(day);
      const count = solvesByDay.get(key) || 0;
      const level = heatmapLevel(count);
      const label = `${formatActivityDate(key)} - ${count} ${count === 1 ? "log" : "logs"}`;
      return `<span class="heatmap-cell" data-level="${level}" data-tooltip="${escapeAttribute(label)}" title="${escapeAttribute(label)}" aria-label="${escapeAttribute(label)}"></span>`;
    }),
    ...Array.from({ length: trailingBlanks }, () => blankCell)
  ];

  grid.style.setProperty("--heatmap-columns", totalColumns);
  months.style.setProperty("--heatmap-columns", totalColumns);
  grid.innerHTML = cells.join("");
  months.innerHTML = buildHeatmapMonthLabels(days, leadingBlanks);
  initHeatmapTooltip(grid);
}
function initHeatmapTooltip(grid) {
  if (!grid || grid.dataset.tooltipReady === "true") return;
  grid.dataset.tooltipReady = "true";

  const tooltip = document.querySelector(".heatmap-tooltip") || createHeatmapTooltip();

  function showTooltip(cell, event) {
    const label = cell?.dataset?.tooltip;
    if (!label) return;

    tooltip.textContent = label;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
    moveTooltip(event);
  }

  function moveTooltip(event) {
    if (!event || !tooltip.classList.contains("is-visible")) return;

    const offset = 14;
    const left = Math.min(event.clientX + offset, window.innerWidth - tooltip.offsetWidth - 12);
    const top = Math.max(12, event.clientY - tooltip.offsetHeight - offset);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  grid.addEventListener("pointerover", (event) => {
    const cell = event.target.closest(".heatmap-cell:not(.is-empty)");
    showTooltip(cell, event);
  });

  grid.addEventListener("pointermove", (event) => {
    const cell = event.target.closest(".heatmap-cell:not(.is-empty)");
    if (!cell) {
      hideTooltip();
      return;
    }

    moveTooltip(event);
  });
  grid.addEventListener("pointerout", (event) => {
    if (!grid.contains(event.relatedTarget)) hideTooltip();
  });
  grid.addEventListener("pointerleave", hideTooltip);
}

function createHeatmapTooltip() {
  const tooltip = document.createElement("div");
  tooltip.className = "heatmap-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tooltip);
  return tooltip;
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

loadHtbSolves().then(() => {
  renderHtbTracker();
  initRevealMotion();
});
let revealObserver;

function initRevealMotion() {
  const targets = document.querySelectorAll(".reveal-target, .hero-content, .hero-visual, .section-heading, .process-step, .project-card, .page-hero, .archive-heading, .archive-dashboard article, .archive-map, .archive-main, .bento-card, .board-card, .rule-card, .lab-slip, .case-file, .build-file, .showcase-tile, .evidence-strip article, .about-panel");
  registerRevealTargets(targets);
}

function registerRevealTargets(targets) {
  const items = Array.from(targets || []).filter((target) => !target.dataset.revealReady);
  if (!items.length) return;

  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
    items.forEach((target) => {
      target.dataset.revealReady = "true";
      target.classList.add("is-visible");
    });
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });
  }

  items.forEach((target, index) => {
    target.dataset.revealReady = "true";
    target.style.setProperty("--reveal-delay", `${Math.min(index * 45, 180)}ms`);
    revealObserver.observe(target);
  });
}

initRevealMotion();

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
