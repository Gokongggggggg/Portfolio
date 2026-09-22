const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");


const wallpaperHero = document.querySelector(".wallpaper-hero");
if (wallpaperHero) {
  window.setTimeout(() => {
    document.body.classList.add("is-scroll-nudge");

    if (!reducedMotionQuery.matches && window.scrollY < 24) {
      window.scrollBy({
        top: Math.min(window.innerHeight * 0.14, 120),
        behavior: "smooth"
      });
    }
  }, 3000);
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

const standaloneWriteups = [
  {
    date: "2026-08-17",
    type: "challenge",
    solveType: "ctf",
    name: "JSON Warehouse",
    category: "Web",
    event: "GaslightCTF",
    published: true,
    award: "Best Writeup Award",
    summary: "From this source code, we can see that the flag is stored inside the admin's warehouse.",
    cover: "public/images/events/gaslightctf-logo.png",
    coverAlt: "GaslightCTF flame logo",
    coverStyle: "wide-logo",
    lesson: "Prototype pollution in Elysia schema merging is used to reach the admin warehouse.",
    link: "writeups/gaslightctf.html?challenge=json-warehouse",
    writeupUrl: "writeups/gaslightctf.html?challenge=json-warehouse",
    tags: ["Web", "GaslightCTF", "Elysia", "Prototype Pollution"]
  },
  {
    date: "2026-08-17",
    type: "challenge",
    solveType: "ctf",
    name: "MessageBoard",
    category: "Web",
    event: "GaslightCTF",
    published: true,
    summary: "The ORDER BY primitive lets us compare the secret values of users who have published a story.",
    cover: "public/images/events/gaslightctf-logo.png",
    coverAlt: "GaslightCTF flame logo",
    coverStyle: "wide-logo",
    lesson: "A user-controlled ORDER BY column turns lexicographic sorting into a secret oracle.",
    link: "writeups/gaslightctf.html?challenge=messageboard",
    writeupUrl: "writeups/gaslightctf.html?challenge=messageboard",
    tags: ["Web", "GaslightCTF", "SQL", "Binary Search"]
  },
  {
    date: "2026-08-17",
    type: "challenge",
    solveType: "ctf",
    name: "Corridors",
    category: "Web",
    event: "GaslightCTF",
    published: true,
    summary: "Since the corridor can go on for hundreds of steps, doing this manually would take too long, so we can automate the process with a simple script",
    cover: "public/images/events/gaslightctf-logo.png",
    coverAlt: "GaslightCTF flame logo",
    coverStyle: "wide-logo",
    lesson: "Automate the route, then reinterpret the left and right sequence as binary.",
    link: "writeups/gaslightctf.html?challenge=corridors",
    writeupUrl: "writeups/gaslightctf.html?challenge=corridors",
    tags: ["Web", "GaslightCTF", "Automation", "Binary"]
  },
  {
    date: "2026-08-16",
    type: "challenge",
    solveType: "ctf",
    name: "Biscuit",
    category: "Web",
    event: "GaslightCTF",
    published: true,
    summary: "If we look at the given source code, we can see that mint() looks pretty sus because the username seems comes directly from user input and gets inserted into the Biscuit builder f-string",
    cover: "public/images/events/gaslightctf-logo.png",
    coverAlt: "GaslightCTF flame logo",
    coverStyle: "wide-logo",
    lesson: "Inject a valid role fact through an unsafe Biscuit builder string.",
    link: "writeups/gaslightctf.html?challenge=biscuit",
    writeupUrl: "writeups/gaslightctf.html?challenge=biscuit",
    tags: ["Web", "GaslightCTF", "Biscuit", "Injection"]
  },
  {
    date: "2026-08-16",
    type: "challenge",
    solveType: "ctf",
    name: "Crawl",
    category: "Web",
    event: "GaslightCTF",
    published: true,
    summary: "From the challenge description, we already get a pretty strong hint to check robots.txt",
    cover: "public/images/events/gaslightctf-logo.png",
    coverAlt: "GaslightCTF flame logo",
    coverStyle: "wide-logo",
    lesson: "Follow the crawler hint to inspect paths hidden by robots.txt.",
    link: "writeups/gaslightctf.html?challenge=crawl",
    writeupUrl: "writeups/gaslightctf.html?challenge=crawl",
    tags: ["Web", "GaslightCTF", "robots.txt", "Recon"]
  },
  {
    date: "2026-09-18",
    type: "challenge",
    solveType: "ctf",
    name: "Macrohard Azuer",
    category: "Web",
    event: "K17 CTF",
    published: true,
    award: "Best Writeup Award",
    summary: "The confirmed primitive was that urljoin() lets me control the final URL, and after the URL is built, there is no filtering at all.",
    cover: "public/images/events/k17-ctf-logo.png",
    coverAlt: "K17 CTF logo",
    coverStyle: "logo",
    lesson: "The trick is to use NaN.",
    link: "writeups/macrohard-azuer.html",
    writeupUrl: "writeups/macrohard-azuer.html",
    tags: ["Web", "K17 CTF", "urljoin", "file://", "NaN"]
  },
  {
    date: "2026-07-06",
    type: "challenge",
    solveType: "ctf",
    name: "HVL",
    category: "Web",
    event: "V1T 2026",
    published: true,
    summary: "The page source and rendered output display completely different text. The actual trick was a custom font disguised as NotoSans-Regular.ttf with custom glyph mapping.",
    cover: "public/images/events/v1t-duck-logo.png",
    coverAlt: "V1T Duck logo",
    coverStyle: "logo",
    lesson: "Inspect embedded font glyph mapping when text in the DOM differs from what is visually rendered.",
    link: "writeups/hvl.html",
    writeupUrl: "writeups/hvl.html",
    tags: ["Web", "V1T 2026", "Custom Font", "Glyph Mapping"]
  },
  {
    date: "2026-07-13",
    type: "challenge",
    solveType: "ctf",
    name: "QR Reconstruction",
    category: "Misc",
    event: "BroncoCTF",
    published: true,
    summary: "A short writeup on rebuilding a fragmented QR code by recognizing the spatial clue that automated recovery tools missed.",
    cover: "public/images/events/broncoctf-mascot.png",
    coverAlt: "BroncoCTF mascot",
    coverStyle: "mascot",
    lesson: "Manual visual inspection beats automated solvers when image fragments preserve physical alignment clues.",
    link: "writeups/bronco-qr-reconstruction.html",
    writeupUrl: "writeups/bronco-qr-reconstruction.html",
    tags: ["Misc", "BroncoCTF", "QR Code", "Reconstruction"]
  },
  {
    date: "2026-07-06",
    type: "challenge",
    solveType: "ctf",
    name: "Admin Fury",
    category: "OSINT",
    event: "FIT Competition",
    published: true,
    summary: "Visual clues pointed to Comifuro 22; the official venue map was used to locate the RGB Team booth and derive the row range required by the flag.",
    coverStyle: "mark",
    coverMark: "FIT",
    coverLabel: "Competition",
    lesson: "Use event floor plans and visual landmark clues to pinpoint exact booth coordinates.",
    link: "writeups/admin-fury.html",
    writeupUrl: "writeups/admin-fury.html",
    tags: ["OSINT", "FIT Competition", "Geolocation", "Map Analysis"]
  }
];

const upsolveTargets = [
  {
    name: "Enterprise",
    event: "Wreckit 7.0",
    completed: false,
    status: "Coming soon",
    cover: "public/images/events/wreckit-7-cover.webp",
    coverAlt: "WRECK-IT 7.0 shield and circuit logo",
    note: "Queued for a proper post-competition solve, review, and documented lesson."
  },
  {
    name: "Tailgate",
    event: "Wreckit 7.0",
    completed: false,
    status: "Coming soon",
    cover: "public/images/events/wreckit-7-cover.webp",
    coverAlt: "WRECK-IT 7.0 shield and circuit logo",
    note: "Queued for a proper post-competition solve, review, and documented lesson."
  }
];

let activeSolveFilter = "all";
let activeSolvePage = 1;
const solvesPerPage = 8;
let htbControlsReady = false;
let activeCtfFilter = "all";
let activeCategoryFilter = "all";
let activeWriteupHero = 0;
let catalogOutsideClickWired = false;
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
  const writeupCount = sortedSolves.filter(isPublishedWriteup).length;

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
            ${renderSolveSource(solve)}
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

function renderWriteupActivity() {
  const categoryList = document.querySelector("#writeup-category-share");
  const recentList = document.querySelector("#writeup-recent-solves");
  if (!categoryList || !recentList) return;

  const sortedSolves = [...htbSolves].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 30);
  recentCutoff.setHours(0, 0, 0, 0);
  const completedUpsolves = upsolveTargets.filter((target) => target.completed).length;
  const totalUpsolves = upsolveTargets.length;
  const remainingUpsolves = totalUpsolves - completedUpsolves;
  const upsolveProgress = totalUpsolves ? Math.round((completedUpsolves / totalUpsolves) * 100) : 0;

  document.querySelectorAll('[data-writeup-activity-stat="total"]').forEach((node) => {
    setStatValue(node, sortedSolves.length);
  });
  document.querySelectorAll('[data-writeup-activity-stat="recent"]').forEach((node) => {
    setStatValue(node, sortedSolves.filter((solve) => new Date(solve.date) >= recentCutoff).length);
  });
  document.querySelectorAll('[data-upsolve-stat="completed"]').forEach((node) => {
    setStatValue(node, completedUpsolves);
  });
  document.querySelectorAll('[data-upsolve-stat="total"]').forEach((node) => {
    node.textContent = totalUpsolves;
  });
  document.querySelectorAll('[data-upsolve-remaining]').forEach((node) => {
    node.textContent = remainingUpsolves
      ? `${remainingUpsolves} ${remainingUpsolves === 1 ? "challenge" : "challenges"} I still need to upsolve.`
      : "All committed challenges have been upsolved.";
  });
  document.querySelectorAll('[data-upsolve-progress]').forEach((node) => {
    node.style.setProperty("--upsolve-progress", `${upsolveProgress}%`);
    node.setAttribute("aria-valuenow", String(completedUpsolves));
    node.setAttribute("aria-valuemax", String(totalUpsolves));
  });

  if (!sortedSolves.length) {
    categoryList.innerHTML = "<li>No solved categories yet.</li>";
    recentList.innerHTML = "<li>No recent solves yet.</li>";
    return;
  }

  const categories = Object.entries(sortedSolves.reduce((counts, solve) => {
    const category = solve.category || "Other";
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);

  categoryList.innerHTML = categories.map(([category, count], index) => {
    const percentage = Math.round((count / sortedSolves.length) * 1000) / 10;
    return `
      <li style="--activity-delay: ${index * 60}ms">
        <div>
          <span>${escapeHtml(category)}</span>
          <strong>${percentage}%</strong>
        </div>
        <span class="writeup-category-bar" aria-hidden="true"><i style="--category-share: ${percentage}%"></i></span>
        <small>${count} ${count === 1 ? "solve" : "solves"}</small>
      </li>
    `;
  }).join("");

  recentList.innerHTML = sortedSolves
    .filter((solve) => solve.type === "challenge")
    .slice(0, 5)
    .map((solve) => {
      const content = `
        <div>
          <strong>${escapeHtml(solve.name)}</strong>
          <time datetime="${escapeAttribute(solve.date)}">${formatArchiveDate(solve.date)}</time>
        </div>
        <span>${escapeHtml(solve.category)}</span>
      `;
      const linksToWriteup = Boolean(solve.writeupUrl && solve.link === solve.writeupUrl);
      const tooltip = linksToWriteup ? `Read ${solve.name} writeup` : `Open ${solve.name} on Hack The Box`;
      const externalAttributes = linksToWriteup ? "" : ' target="_blank" rel="noopener noreferrer"';

      if (solve.link && solve.link !== "#") {
        return `
          <li>
            <a class="recent-solve-link" href="${escapeAttribute(solve.link)}"${externalAttributes} data-tooltip="${escapeAttribute(tooltip)}" aria-label="${escapeAttribute(tooltip)}">
              ${content}
            </a>
          </li>
        `;
      }

      return `<li><div class="recent-solve-static">${content}</div></li>`;
    }).join("");
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
  return (solve.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function isPublishedWriteup(solve) {
  return Boolean(solve.writeupUrl) && solve.published === true;
}

function renderWriteupBadge(solve) {
  if (isPublishedWriteup(solve)) {
    return `<a class="writeup-badge has-writeup" href="${escapeAttribute(solve.writeupUrl)}" aria-label="Read ${escapeAttribute(solve.name)} writeup">Read WU</a>`;
  }

  return "";
}

function renderSolveSource(solve) {
  if (!solve.link || solve.link === solve.writeupUrl || solve.link === "#") return "";
  return `<a class="solve-link" href="${escapeAttribute(solve.link)}" aria-label="Open ${escapeAttribute(solve.name)} source">Source</a>`;
}

function renderWriteupLibrary() {
  const catalog = document.querySelector("#writeup-rows");
  if (!catalog) return;

  const seen = new Set();
  const publishedWriteups = [];
  for (const item of [...htbSolves]) {
    if (!isPublishedWriteup(item)) continue;
    const key = item.writeupUrl || item.name;
    if (!seen.has(key)) {
      seen.add(key);
      publishedWriteups.push(item);
    }
  }
  publishedWriteups.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Hero = carousel of best writeups only (award winners)
  const bestWriteups = publishedWriteups.filter((writeup) => writeup.award);
  renderWriteupHero(bestWriteups.length ? bestWriteups : publishedWriteups.slice(0, 1));

  renderWriteupStats(publishedWriteups);
  renderWriteupCatalog(catalog, publishedWriteups);
}

function renderWriteupStats(writeups) {
  const categories = [...new Set(writeups.map((writeup) => writeup.category).filter(Boolean))];
  const latest = writeups[0];

  document.querySelectorAll('[data-writeup-stat="total"]').forEach((node) => {
    node.textContent = writeups.length;
  });
  document.querySelectorAll('[data-writeup-stat="categories"]').forEach((node) => {
    node.textContent = categories.length;
  });
  document.querySelectorAll('[data-writeup-stat="latest"]').forEach((node) => {
    node.textContent = latest?.name || "—";
  });
}

function renderWriteupCatalog(catalog, writeups) {
  const latestByEvent = new Map();
  writeups.forEach((writeup) => {
    if (writeup.event && !latestByEvent.has(writeup.event)) latestByEvent.set(writeup.event, writeup);
  });
  const events = [...latestByEvent.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const preferredOrder = ["Web", "Misc", "OSINT"];
  const categories = [...new Set(writeups.map((writeup) => writeup.category).filter(Boolean))]
    .sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

  const dropdownHtml = (name, label, options, filterAttr) => `
    <div class="catalog-dropdown">
      <button type="button" class="catalog-dropdown-toggle" data-dropdown-toggle="${name}" aria-expanded="false" aria-haspopup="true">
        <span>${escapeHtml(label)}</span>
        <strong data-dropdown-value="${name}">All</strong>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="catalog-dropdown-panel" data-dropdown-panel="${name}" hidden>
        ${options.map((value) => `
          <button type="button" data-${filterAttr}="${escapeAttribute(value)}">
            <span>${value === "all" ? "All" : escapeHtml(value)}</span>
            <small>0</small>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  catalog.innerHTML = `
    <div class="catalog-toolbar">
      <div class="catalog-search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input class="solve-search" type="search" placeholder="Search by title, CTF, or technique..." aria-label="Search writeups" autocomplete="off" spellcheck="false">
      </div>
      ${dropdownHtml("ctf", "CTF", ["all", ...events.map((writeup) => writeup.event)], "ctf-filter")}
      ${dropdownHtml("category", "Category", ["all", ...categories], "category-filter")}
    </div>
    <p class="catalog-result-count" aria-live="polite"></p>
    <div class="catalog-grid"></div>
  `;

  const searchInput = catalog.querySelector(".catalog-search input");
  const gridNode = catalog.querySelector(".catalog-grid");
  const countNode = catalog.querySelector(".catalog-result-count");

  const matchesSearch = (writeup, query) => !query || [
    writeup.name,
    writeup.event,
    writeup.category,
    writeup.summary,
    writeup.lesson,
    ...(writeup.tags || [])
  ].map(normalizeSearch).join(" ").includes(query);

  const refreshCatalog = () => {
    const query = normalizeSearch(searchInput.value);

    catalog.querySelectorAll("[data-ctf-filter]").forEach((button) => {
      const event = button.dataset.ctfFilter || "all";
      const count = writeups.filter((writeup) =>
        (event === "all" || writeup.event === event) &&
        (activeCategoryFilter === "all" || writeup.category === activeCategoryFilter) &&
        matchesSearch(writeup, query)
      ).length;
      button.querySelector("small").textContent = count;
      button.classList.toggle("is-zero", count === 0);
      button.classList.toggle("is-active", event === activeCtfFilter);
    });

    catalog.querySelectorAll("[data-category-filter]").forEach((button) => {
      const category = button.dataset.categoryFilter || "all";
      const count = writeups.filter((writeup) =>
        (category === "all" || writeup.category === category) &&
        (activeCtfFilter === "all" || writeup.event === activeCtfFilter) &&
        matchesSearch(writeup, query)
      ).length;
      button.querySelector("small").textContent = count;
      button.classList.toggle("is-zero", count === 0);
      button.classList.toggle("is-active", category === activeCategoryFilter);
    });

    const filtered = writeups.filter((writeup) =>
      (activeCtfFilter === "all" || writeup.event === activeCtfFilter) &&
      (activeCategoryFilter === "all" || writeup.category === activeCategoryFilter) &&
      matchesSearch(writeup, query)
    );

    countNode.textContent = filtered.length === writeups.length
      ? `${writeups.length} writeups`
      : `Showing ${filtered.length} of ${writeups.length} writeups`;

    gridNode.innerHTML = filtered.length
      ? filtered.map((writeup, index) => renderWriteupCard(writeup, index)).join("")
      : `<p class="catalog-empty">No writeups match this CTF, category, or keyword.</p>`;

    catalog.querySelector('[data-dropdown-value="ctf"]').textContent = activeCtfFilter === "all" ? "All" : activeCtfFilter;
    catalog.querySelector('[data-dropdown-value="category"]').textContent = activeCategoryFilter === "all" ? "All" : activeCategoryFilter;
    catalog.querySelector('[data-dropdown-toggle="ctf"]').classList.toggle("has-filter", activeCtfFilter !== "all");
    catalog.querySelector('[data-dropdown-toggle="category"]').classList.toggle("has-filter", activeCategoryFilter !== "all");
  };

  const closeDropdowns = () => {
    catalog.querySelectorAll(".catalog-dropdown").forEach((wrapper) => {
      wrapper.querySelector(".catalog-dropdown-toggle").setAttribute("aria-expanded", "false");
      wrapper.querySelector(".catalog-dropdown-panel").hidden = true;
    });
  };

  searchInput.addEventListener("input", refreshCatalog);
  catalog.querySelectorAll(".catalog-dropdown-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const panel = toggle.closest(".catalog-dropdown").querySelector(".catalog-dropdown-panel");
      const willOpen = panel.hidden;
      closeDropdowns();
      panel.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });
  catalog.querySelectorAll("[data-ctf-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCtfFilter = button.dataset.ctfFilter || "all";
      refreshCatalog();
      closeDropdowns();
    });
  });
  catalog.querySelectorAll("[data-category-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategoryFilter = button.dataset.categoryFilter || "all";
      refreshCatalog();
      closeDropdowns();
    });
  });

  refreshCatalog();

  if (!catalogOutsideClickWired) {
    catalogOutsideClickWired = true;
    const closeAllDropdowns = () => {
      document.querySelectorAll(".catalog-dropdown-panel").forEach((panel) => {
        panel.hidden = true;
      });
      document.querySelectorAll(".catalog-dropdown-toggle").forEach((toggle) => {
        toggle.setAttribute("aria-expanded", "false");
      });
    };
    document.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest(".catalog-dropdown")) return;
      closeAllDropdowns();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAllDropdowns();
    });
  }
}

function renderWriteupCard(writeup, index) {
  const mediaClass = `${writeup.coverStyle === "mascot" ? " is-mascot" : ""}${writeup.coverStyle === "logo" ? " is-logo" : ""}${writeup.coverStyle === "wide-logo" ? " is-wide-logo" : ""}${writeup.coverStyle === "mark" ? " is-event-mark" : ""}`;

  return `
    <a class="catalog-card" href="${escapeAttribute(writeup.writeupUrl)}">
      <div class="catalog-card-media${mediaClass}">
        ${writeup.cover ? `<img src="${escapeAttribute(writeup.cover)}" alt="${escapeAttribute(writeup.coverAlt || "")}" loading="${index === 0 ? "eager" : "lazy"}">` : ""}
        ${writeup.coverStyle === "mark" ? `<div class="writeup-card-mark" role="img" aria-label="${escapeAttribute(`${writeup.event || "FIT Competition"} event mark`)}"><span>${escapeHtml(writeup.coverMark || "FIT")}</span><small>${escapeHtml(writeup.coverLabel || writeup.event || "Competition")}</small></div>` : ""}
        <span class="catalog-card-category">${escapeHtml(writeup.category)}</span>
      </div>
      <div class="catalog-card-copy">
        ${writeup.award ? `<span class="catalog-card-award">🏆 ${escapeHtml(writeup.award)}</span>` : ""}
        <h3>${escapeHtml(writeup.name)}</h3>
        <p><span>${escapeHtml(writeup.event || "CTF")}</span><time datetime="${escapeAttribute(writeup.date)}">${formatArchiveDate(writeup.date)}</time></p>
      </div>
    </a>
  `;
}

function renderWriteupHero(writeups) {
  const hero = document.querySelector("#writeup-cinematic-hero");
  if (!hero || !writeups.length) return;

  const slideHtml = (writeup) => {
    const mediaClass = `${writeup.coverStyle === "mascot" ? " is-mascot" : ""}${writeup.coverStyle === "logo" ? " is-logo" : ""}${writeup.coverStyle === "wide-logo" ? " is-wide-logo" : ""}${writeup.coverStyle === "mark" ? " is-event-mark" : ""}`;
    return `
      <div class="writeup-hero-slide" aria-roledescription="slide" aria-label="${escapeAttribute(writeup.name)}">
        <div class="writeup-cinematic-media${mediaClass}" aria-hidden="true">
          ${writeup.cover ? `<img src="${escapeAttribute(writeup.cover)}" alt="">` : ""}
          ${writeup.coverStyle === "mark" ? `<div class="writeup-card-mark"><span>${escapeHtml(writeup.coverMark || "FIT")}</span><small>${escapeHtml(writeup.coverLabel || writeup.event || "Competition")}</small></div>` : ""}
        </div>
        <div class="writeup-cinematic-shade"></div>
        <div class="writeup-cinematic-copy">
          <div class="writeup-cinematic-kicker">
            ${writeup.award ? `<span class="award-tag">🏆 ${escapeHtml(writeup.award)}</span>` : ""}
            <span>${escapeHtml(writeup.event || "CTF")}</span>
          </div>
          <h1>${String(writeup.name || "Writeup").split(/\s+/).map((word) => `<span>${escapeHtml(word)}</span>`).join("")}</h1>
          <div class="writeup-cinematic-meta">
            <strong>${escapeHtml(writeup.category)}</strong>
            <time datetime="${escapeAttribute(writeup.date)}">${formatArchiveDate(writeup.date)}</time>
            ${(writeup.tags || []).slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
          <p>${escapeHtml(writeup.summary || writeup.lesson)}</p>
          <div class="hero-actions">
            <a class="button primary" href="${escapeAttribute(writeup.writeupUrl)}">Read writeup</a>
          </div>
        </div>
      </div>
    `;
  };

  hero.innerHTML = `
    <div class="writeup-hero-track">${writeups.map(slideHtml).join("")}</div>
    ${writeups.length > 1 ? `
      <button type="button" class="writeup-hero-arrow is-prev" data-hero-direction="-1" aria-label="Previous best writeup">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button type="button" class="writeup-hero-arrow is-next" data-hero-direction="1" aria-label="Next best writeup">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <div class="writeup-hero-dots" aria-label="Choose best writeup">
        ${writeups.map((writeup, index) => `<button type="button" data-hero-slide="${index}" aria-label="${escapeAttribute(writeup.name)}"></button>`).join("")}
      </div>
    ` : ""}
  `;

  const track = hero.querySelector(".writeup-hero-track");
  const dots = [...hero.querySelectorAll("[data-hero-slide]")];
  activeWriteupHero = Math.min(activeWriteupHero, writeups.length - 1);

  const applyTransform = (offsetPx = 0) => {
    track.style.transform = `translateX(calc(${-activeWriteupHero * 100}% + ${offsetPx}px))`;
  };

  const goTo = (index) => {
    activeWriteupHero = (index + writeups.length) % writeups.length;
    applyTransform();
    dots.forEach((dot, dotIndex) => {
      dot.toggleAttribute("aria-current", dotIndex === activeWriteupHero);
    });
  };

  hero.querySelectorAll("[data-hero-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      goTo(activeWriteupHero + Number(button.dataset.heroDirection));
    });
  });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => goTo(Number(dot.dataset.heroSlide)));
  });
  hero.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeWriteupHero - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeWriteupHero + 1);
    }
  });

  let dragStartX = null;
  let dragOffset = 0;
  hero.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStartX = event.clientX;
    dragOffset = 0;
    track.style.transition = "none";
  });
  hero.addEventListener("pointermove", (event) => {
    if (dragStartX === null) return;
    dragOffset = event.clientX - dragStartX;
    applyTransform(dragOffset);
  });
  const endDrag = () => {
    if (dragStartX === null) return;
    const threshold = Math.max(56, hero.clientWidth * 0.08);
    const jumped = Math.abs(dragOffset) > threshold ? Math.sign(dragOffset) * -1 : 0;
    dragStartX = null;
    dragOffset = 0;
    track.style.transition = "";
    goTo(activeWriteupHero + jumped);
  };
  hero.addEventListener("pointerup", endDrag);
  hero.addEventListener("pointercancel", endDrag);
  hero.addEventListener("pointerleave", endDrag);

  goTo(activeWriteupHero);
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
  const monthStarts = [];
  let lastMonth = "";

  days.forEach((day, index) => {
    const month = day.toLocaleString("en", { month: "short" });
    if (month !== lastMonth) {
      monthStarts.push({
        month,
        column: Math.floor((index + leadingBlanks) / 7) + 1
      });
      lastMonth = month;
    }
  });

  return monthStarts.map((label, index) => {
    const nextColumn = monthStarts[index + 1]?.column || "-1";
    return `<span style="grid-column: ${label.column} / ${nextColumn};">${label.month}</span>`;
  }).join("");
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
  renderWriteupLibrary();
  renderWriteupActivity();
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
  const library = document.querySelector("#writeup-library, #writeup-rows");
  if (!tracker && !library) return;

  try {
    const response = await fetch("data/htb-solves.json", { cache: "no-store" });
    if (!response.ok) throw new Error("HTB solves JSON not available");

    const payload = await response.json();
    if (Array.isArray(payload?.items)) {
      htbSolves = [...standaloneWriteups, ...payload.items];
    }
  } catch (error) {
    htbSolves = [...standaloneWriteups, ...htbSolves];
  }
}
