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
const htbSolves = [
  {
    date: "2026-07-04",
    type: "challenge",
    solveType: "own",
    name: "Secure Notes",
    category: "Web",
    lesson: "Prototype pollution in Mongoose can change how backend trust checks behave.",
    link: "#",
    tags: ["Web", "Mongoose", "Prototype Pollution"]
  }
];

function renderHtbTracker() {
  const feed = document.querySelector("#htb-activity-feed");
  const log = document.querySelector("#htb-solve-log");

  if (!feed || !log) return;

  const sortedSolves = [...htbSolves].sort((a, b) => new Date(b.date) - new Date(a.date));
  const machineCount = sortedSolves.filter((solve) => solve.type === "machine").length;
  const challengeCount = sortedSolves.filter((solve) => solve.type === "challenge").length;
  const latestSolve = sortedSolves[0];

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

  feed.innerHTML = sortedSolves.slice(0, 4).map((solve) => `
    <article class="activity-item">
      <span class="activity-dot" aria-hidden="true"></span>
      <div>
        <h4>${solve.name}</h4>
        <p>${solve.category} / ${solve.type} / ${solve.solveType}</p>
        <span class="activity-meta">${formatActivityDate(solve.date)}</span>
      </div>
    </article>
  `).join("");

  log.innerHTML = sortedSolves.map((solve) => `
    <article class="solve-entry">
      <div class="solve-topline">
        <div>
          <span class="solve-meta">${formatActivityDate(solve.date)} / ${solve.type}</span>
          <h4>${solve.name}</h4>
        </div>
        <a class="solve-link" href="${solve.link}" aria-label="Open ${solve.name} log">View</a>
      </div>
      <p>${solve.lesson}</p>
      <div class="solve-tags" aria-label="${solve.name} tags">
        ${solve.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function formatActivityDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

renderHtbTracker();
