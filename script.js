const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = window.location.pathname.split("/").pop() || "index.html";
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
let activeWriteupCategory = "all";
let writeupControlsReady = false;
let writeupShelfReady = false;
let activeWriteupHero = 0;
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
      const tooltip = `Open ${solve.name} on Hack The Box`;

      if (solve.link && solve.link !== "#") {
        return `
          <li>
            <a class="recent-solve-link" href="${escapeAttribute(solve.link)}" target="_blank" rel="noopener noreferrer" data-tooltip="${escapeAttribute(tooltip)}" aria-label="${escapeAttribute(tooltip)}">
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

function renderWriteupBadge(solve) {
  if (solve.writeupUrl) {
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
  if (catalog) {
    const writeups = [...htbSolves]
      .filter((solve) => Boolean(solve.writeupUrl))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    renderWriteupStats(writeups);
    renderWriteupHero(writeups);
    renderWriteupRows(catalog, writeups);
    return;
  }

  const library = document.querySelector("#writeup-library");
  if (!library) return;

  const searchInput = document.querySelector("#writeup-search");
  const filterNode = document.querySelector("#writeup-category-filter");
  const writeups = [...htbSolves]
    .filter((solve) => Boolean(solve.writeupUrl))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  renderWriteupHero(writeups);
  renderWriteupShelf(writeups);
  initWriteupControls(searchInput, filterNode, writeups);

  renderWriteupStats(writeups);
  const query = normalizeSearch(searchInput?.value || "");
  const visibleWriteups = writeups.filter((writeup) => {
    const matchesCategory = activeWriteupCategory === "all" || writeup.category === activeWriteupCategory;
    if (!matchesCategory) return false;
    if (!query) return true;

    return [
      writeup.name,
      writeup.event,
      writeup.category,
      writeup.summary,
      writeup.lesson,
      ...(writeup.tags || [])
    ].map(normalizeSearch).join(" ").includes(query);
  });

  if (!visibleWriteups.length) {
    library.innerHTML = `<article class="writeup-library-empty torn-panel"><p class="category">No match</p><h3>No writeups found.</h3><p>Try another title, event, category, or technique.</p></article>`;
    return;
  }

  library.innerHTML = visibleWriteups.map((writeup, index) => `
    <a class="writeup-library-card torn-panel${index === 0 && !query && activeWriteupCategory === "all" ? " is-featured" : ""}" href="${escapeAttribute(writeup.writeupUrl)}">
      <div class="writeup-card-media${writeup.coverStyle === "mascot" ? " is-mascot" : ""}${writeup.coverStyle === "logo" ? " is-logo" : ""}${writeup.coverStyle === "mark" ? " is-event-mark" : ""}">
        ${writeup.cover ? `<img src="${escapeAttribute(writeup.cover)}" alt="${escapeAttribute(writeup.coverAlt || "")}" loading="${index === 0 ? "eager" : "lazy"}">` : ""}
        ${writeup.coverStyle === "mark" ? `<div class="writeup-card-mark" role="img" aria-label="${escapeAttribute(`${writeup.event || "FIT Competition"} event mark`)}"><span>${escapeHtml(writeup.coverMark || "FIT")}</span><small>${escapeHtml(writeup.coverLabel || writeup.event || "Competition")}</small></div>` : ""}
        <span>${index === 0 && !query && activeWriteupCategory === "all" ? "Latest release" : "Published writeup"}</span>
      </div>
      <div class="writeup-card-copy">
        <div class="writeup-card-meta">
          <span>${escapeHtml(writeup.event || "CTF")}</span>
          <span>${escapeHtml(writeup.category)}</span>
          <time datetime="${escapeAttribute(writeup.date)}">${formatArchiveDate(writeup.date)}</time>
        </div>
        <h3>${escapeHtml(writeup.name)}</h3>
        <p>${escapeHtml(writeup.summary || writeup.lesson)}</p>
        <div class="writeup-card-tags">${(writeup.tags || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <strong>Read writeup <span aria-hidden="true">→</span></strong>
      </div>
    </a>
  `).join("");

  registerRevealTargets(library.querySelectorAll(".writeup-library-card"));
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

function renderWriteupRows(catalog, writeups) {
  const categories = [...new Set(writeups.map((writeup) => writeup.category).filter(Boolean))];
  const rows = [
    {
      id: "upsolve",
      title: "Coming soon",
      items: upsolveTargets,
      type: "upsolve"
    },
    ...categories.map((category) => ({
      id: `category-${normalizeSearch(category).replace(/\s+/g, "-")}`,
      title: category,
      items: writeups.filter((writeup) => writeup.category === category)
    }))
  ];

  catalog.innerHTML = rows.map((row) => `
    <section class="catalog-row" aria-labelledby="${escapeAttribute(row.id)}-title">
      <div class="catalog-row-heading">
        <h2 id="${escapeAttribute(row.id)}-title">${escapeHtml(row.title)}</h2>
        <div class="catalog-row-controls" aria-label="${escapeAttribute(`${row.title} controls`)}">
          <button type="button" data-catalog-direction="-1" aria-label="Scroll ${escapeAttribute(row.title)} left">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button type="button" data-catalog-direction="1" aria-label="Scroll ${escapeAttribute(row.title)} right">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div class="catalog-track" tabindex="0" aria-label="${escapeAttribute(row.title)} writeups">
        ${row.items.map((writeup, index) => row.type === "upsolve" ? renderUpsolveCard(writeup, index) : renderWriteupRowCard(writeup, index)).join("")}
      </div>
    </section>
  `).join("");

  catalog.querySelectorAll(".catalog-row").forEach((row) => initCatalogRow(row));
}

function renderUpsolveCard(target, index) {
  const descriptionId = `upsolve-${normalizeSearch(target.name).replace(/\s+/g, "-")}-description`;
  const status = target.completed ? "Upsolved" : target.status;
  const note = target.completed
    ? "Upsolve completed and added to the public progress count."
    : target.note;
  return `
    <article class="catalog-card catalog-card-upsolve${target.completed ? " is-complete" : ""}" tabindex="0" aria-describedby="${escapeAttribute(descriptionId)}">
      <div class="catalog-card-media upsolve-card-media">
        <img src="${escapeAttribute(target.cover)}" alt="${escapeAttribute(target.coverAlt)}" loading="${index === 0 ? "eager" : "lazy"}">
        <span class="catalog-card-category upsolve-status">${escapeHtml(status)}</span>
        <p class="upsolve-hover-note" id="${escapeAttribute(descriptionId)}">${escapeHtml(note)}</p>
      </div>
      <div class="catalog-card-copy">
        <h3>${escapeHtml(target.name)}</h3>
        <p><span>${escapeHtml(target.event)}</span><strong>Upsolve target</strong></p>
      </div>
    </article>
  `;
}

function renderWriteupRowCard(writeup, index) {
  const mediaClass = `${writeup.coverStyle === "mascot" ? " is-mascot" : ""}${writeup.coverStyle === "logo" ? " is-logo" : ""}${writeup.coverStyle === "mark" ? " is-event-mark" : ""}`;
  return `
    <a class="catalog-card" href="${escapeAttribute(writeup.writeupUrl)}">
      <div class="catalog-card-media${mediaClass}">
        ${writeup.cover ? `<img src="${escapeAttribute(writeup.cover)}" alt="${escapeAttribute(writeup.coverAlt || "")}" loading="${index === 0 ? "eager" : "lazy"}">` : ""}
        ${writeup.coverStyle === "mark" ? `<div class="writeup-card-mark" role="img" aria-label="${escapeAttribute(`${writeup.event || "FIT Competition"} event mark`)}"><span>${escapeHtml(writeup.coverMark || "FIT")}</span><small>${escapeHtml(writeup.coverLabel || writeup.event || "Competition")}</small></div>` : ""}
        <span class="catalog-card-category">${escapeHtml(writeup.category)}</span>
      </div>
      <div class="catalog-card-copy">
        <h3>${escapeHtml(writeup.name)}</h3>
        <p><span>${escapeHtml(writeup.event || "CTF")}</span><time datetime="${escapeAttribute(writeup.date)}">${formatArchiveDate(writeup.date)}</time></p>
      </div>
    </a>
  `;
}

function initCatalogRow(row) {
  const track = row.querySelector(".catalog-track");
  const buttons = row.querySelectorAll("[data-catalog-direction]");
  if (!track) return;

  const updateButtons = () => {
    const atStart = track.scrollLeft <= 4;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    buttons.forEach((button) => {
      button.disabled = Number(button.dataset.catalogDirection) < 0 ? atStart : atEnd;
    });
  };

  const scrollTrack = (direction) => {
    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.82, 280),
      behavior: reducedMotionQuery.matches ? "auto" : "smooth"
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => scrollTrack(Number(button.dataset.catalogDirection) || 1));
  });
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    scrollTrack(event.key === "ArrowLeft" ? -1 : 1);
  });
  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
}

function renderWriteupHero(writeups) {
  const hero = document.querySelector("#writeup-cinematic-hero");
  if (!hero || !writeups.length) return;

  activeWriteupHero = Math.min(activeWriteupHero, writeups.length - 1);
  const writeup = writeups[activeWriteupHero];
  const mediaClass = `${writeup.coverStyle === "mascot" ? " is-mascot" : ""}${writeup.coverStyle === "logo" ? " is-logo" : ""}${writeup.coverStyle === "mark" ? " is-event-mark" : ""}`;

  hero.innerHTML = `
    <div class="writeup-cinematic-media${mediaClass}" aria-hidden="true">
      ${writeup.cover ? `<img src="${escapeAttribute(writeup.cover)}" alt="">` : ""}
      ${writeup.coverStyle === "mark" ? `<div class="writeup-card-mark"><span>${escapeHtml(writeup.coverMark || "FIT")}</span><small>${escapeHtml(writeup.coverLabel || writeup.event || "Competition")}</small></div>` : ""}
    </div>
    <div class="writeup-cinematic-shade"></div>
    <div class="writeup-cinematic-copy">
      <div class="writeup-cinematic-kicker">
        <span>Featured writeup</span>
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
        <a class="button secondary" href="#writeup-catalog">Browse catalog</a>
      </div>
      <div class="writeup-cinematic-dots" role="group" aria-label="Choose featured writeup">
        ${writeups.map((item, index) => `<button type="button" class="${index === activeWriteupHero ? "is-active" : ""}" data-writeup-hero="${index}" aria-label="Show ${escapeAttribute(item.name)}" aria-pressed="${index === activeWriteupHero}"></button>`).join("")}
      </div>
    </div>
  `;

  hero.querySelectorAll("[data-writeup-hero]").forEach((button) => {
    button.addEventListener("click", () => {
      activeWriteupHero = Number(button.dataset.writeupHero) || 0;
      renderWriteupHero(writeups);
    });
  });
}

function renderWriteupShelf(writeups) {
  const shelf = document.querySelector("#writeup-featured-shelf");
  if (!shelf) return;

  shelf.innerHTML = writeups.map((writeup, index) => `
    <a class="writeup-shelf-card torn-panel" href="${escapeAttribute(writeup.writeupUrl)}">
      <div class="writeup-card-media${writeup.coverStyle === "mascot" ? " is-mascot" : ""}${writeup.coverStyle === "logo" ? " is-logo" : ""}${writeup.coverStyle === "mark" ? " is-event-mark" : ""}">
        ${writeup.cover ? `<img src="${escapeAttribute(writeup.cover)}" alt="${escapeAttribute(writeup.coverAlt || "")}" loading="${index === 0 ? "eager" : "lazy"}">` : ""}
        ${writeup.coverStyle === "mark" ? `<div class="writeup-card-mark" role="img" aria-label="${escapeAttribute(`${writeup.event || "FIT Competition"} event mark`)}"><span>${escapeHtml(writeup.coverMark || "FIT")}</span><small>${escapeHtml(writeup.coverLabel || writeup.event || "Competition")}</small></div>` : ""}
        <span>${index === 0 ? "Latest release" : "Featured"}</span>
      </div>
      <div class="writeup-shelf-copy">
        <div class="writeup-card-meta">
          <span>${escapeHtml(writeup.event || "CTF")}</span>
          <span>${escapeHtml(writeup.category)}</span>
          <time datetime="${escapeAttribute(writeup.date)}">${formatArchiveDate(writeup.date)}</time>
        </div>
        <h3>${escapeHtml(writeup.name)}</h3>
        <p>${escapeHtml(writeup.summary || writeup.lesson)}</p>
        <strong>Read writeup <span aria-hidden="true">&rarr;</span></strong>
      </div>
    </a>
  `).join("");

  initWriteupShelfControls(shelf);
  updateWriteupShelfControls(shelf);
}

function initWriteupShelfControls(shelf) {
  if (writeupShelfReady) return;
  writeupShelfReady = true;

  const scrollShelf = (direction) => {
    const distance = Math.max(shelf.clientWidth * 0.78, 280);
    shelf.scrollBy({
      left: direction * distance,
      behavior: reducedMotionQuery.matches ? "auto" : "smooth"
    });
  };

  document.querySelectorAll("[data-shelf-scroll]").forEach((button) => {
    button.addEventListener("click", () => scrollShelf(Number(button.dataset.shelfScroll) || 1));
  });

  shelf.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    scrollShelf(event.key === "ArrowLeft" ? -1 : 1);
  });
  shelf.addEventListener("scroll", () => updateWriteupShelfControls(shelf), { passive: true });
  window.addEventListener("resize", () => updateWriteupShelfControls(shelf));
}

function updateWriteupShelfControls(shelf) {
  const atStart = shelf.scrollLeft <= 4;
  const atEnd = shelf.scrollLeft + shelf.clientWidth >= shelf.scrollWidth - 4;
  document.querySelectorAll("[data-shelf-scroll]").forEach((button) => {
    const direction = Number(button.dataset.shelfScroll);
    button.disabled = direction < 0 ? atStart : atEnd;
  });
}

function initWriteupControls(searchInput, filterNode, writeups) {
  if (writeupControlsReady) return;
  writeupControlsReady = true;

  const categories = [...new Set(writeups.map((writeup) => writeup.category).filter(Boolean))];
  if (filterNode) {
    filterNode.innerHTML = ["all", ...categories].map((category) => `
      <button type="button" class="${category === "all" ? "is-active" : ""}" data-writeup-category="${escapeAttribute(category)}">
        ${category === "all" ? "All" : escapeHtml(category)}
      </button>
    `).join("");

    filterNode.querySelectorAll("[data-writeup-category]").forEach((button) => {
      button.addEventListener("click", () => {
        activeWriteupCategory = button.dataset.writeupCategory || "all";
        filterNode.querySelectorAll("[data-writeup-category]").forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });
        renderWriteupLibrary();
      });
    });
  }

  searchInput?.addEventListener("input", renderWriteupLibrary);
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
      htbSolves = payload.items;
    }
  } catch (error) {
    // Keep the manual fallback data when the generated JSON is unavailable locally.
  }
}
