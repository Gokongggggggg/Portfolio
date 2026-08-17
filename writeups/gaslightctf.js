const gaslightSeries = [
  {
    slug: "json-warehouse",
    title: "JSON Warehouse",
    file: "gaslightctf/JSON-Warehouse.md",
    date: "2026-08-17",
    topic: "Elysia / Prototype Pollution",
    summary: "Prototype pollution in Elysia schema merging opens a path into the admin warehouse."
  },
  {
    slug: "messageboard",
    title: "MessageBoard",
    file: "gaslightctf/MessageBoard.md",
    date: "2026-08-17",
    topic: "SQL / Binary Search",
    summary: "A user-controlled sort column becomes a lexicographic oracle for the admin secret."
  },
  {
    slug: "corridors",
    title: "Corridors",
    file: "gaslightctf/Corridors.md",
    date: "2026-08-17",
    topic: "Automation / Binary",
    summary: "Automate hundreds of turns, then decode the route itself as a binary message."
  },
  {
    slug: "biscuit",
    title: "Biscuit",
    file: "gaslightctf/Biscuit.md",
    date: "2026-08-16",
    topic: "Biscuit / Injection",
    summary: "User input reaches a Biscuit builder string and creates an authorization injection primitive."
  },
  {
    slug: "crawl",
    title: "Crawl",
    file: "gaslightctf/Crawl.md",
    date: "2026-08-16",
    topic: "robots.txt / Recon",
    summary: "Follow the crawler clue and inspect the paths the site asks bots not to visit."
  }
];

const readerContent = document.querySelector("#gaslight-reader-content");
const readerStatus = document.querySelector("#gaslight-reader-status");
const selectedChallenge = new URLSearchParams(window.location.search).get("challenge");

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInlineMarkdown(value) {
  const tokens = [];
  let output = escapeText(value);

  const preserve = (html) => {
    const token = `@@GASLIGHT_TOKEN_${tokens.length}@@`;
    tokens.push(html);
    return token;
  };

  output = output.replace(/`([^`]+)`/g, (_, code) => preserve(`<code>${code}</code>`));
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => (
    preserve(`<a href="${url}" rel="noreferrer">${label}</a>`)
  ));
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/(^|[\s(])(https?:\/\/[^\s<]+)/g, (_, prefix, url) => (
    `${prefix}${preserve(`<a href="${url}" rel="noreferrer">${url}</a>`)}`
  ));

  tokens.forEach((html, index) => {
    output = output.replace(`@@GASLIGHT_TOKEN_${index}@@`, html);
  });

  return output;
}

function highlightCode(value) {
  const tokenPattern = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|from|export|default|const|let|var|function|return|if|else|for|while|try|catch|throw|new|class|extends|async|await|interface|type|as|in|of|def|lambda|with|yield|and|or|not|is|pass|break|continue)\b|\b(?:true|false|null|undefined|None|True|False)\b|\b\d+(?:\.\d+)?\b/g;
  let highlighted = "";
  let cursor = 0;
  let match;

  while ((match = tokenPattern.exec(value)) !== null) {
    const token = match[0];
    let tokenClass = "syntax-keyword";

    highlighted += escapeText(value.slice(cursor, match.index));

    if (token.startsWith("//") || token.startsWith("/*") || token.startsWith("#")) {
      tokenClass = "syntax-comment";
    } else if (/^["'`]/.test(token)) {
      tokenClass = "syntax-string";
    } else if (/^\d/.test(token)) {
      tokenClass = "syntax-number";
    } else if (/^(?:true|false|null|undefined|None|True|False)$/.test(token)) {
      tokenClass = "syntax-literal";
    }

    highlighted += `<span class="${tokenClass}">${escapeText(token)}</span>`;
    cursor = match.index + token.length;
  }

  return highlighted + escapeText(value.slice(cursor));
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let code = [];
  let codeLanguage = "";
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${renderInlineMarkdown(paragraph.join("\n"))}</p>`);
    paragraph = [];
  };

  const flushCode = () => {
    blocks.push(`<pre><code${codeLanguage ? ` class="language-${escapeText(codeLanguage)}"` : ""}>${highlightCode(code.join("\n"))}</code></pre>`);
    code = [];
    codeLanguage = "";
  };

  lines.forEach((line) => {
    const fence = line.match(/^```\s*(.*)$/);
    if (fence) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        codeLanguage = fence[1].trim();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      code.push(line);
      return;
    }

    const image = line.match(/^!\[\[([^\]]+)\]\]$/);
    if (image) {
      flushParagraph();
      const filename = image[1];
      blocks.push(`<figure><img src="../public/images/writeups/gaslightctf/${encodeURIComponent(filename)}" alt="${escapeText(filename.replace(/\.[^.]+$/, ""))}" loading="lazy"></figure>`);
      return;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      blocks.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      return;
    }

    paragraph.push(line);
  });

  if (inCode) flushCode();
  flushParagraph();
  return blocks.join("\n");
}

function articleHeader(item, position, headingLevel = 1) {
  const headingTag = headingLevel === 2 ? "h2" : "h1";
  return `
    <header class="writeup-title-block">
      <p class="eyebrow">GaslightCTF / Web / ${String(position).padStart(2, "0")}</p>
      <${headingTag}>${escapeText(item.title)}</${headingTag}>
      <div class="writeup-meta-row">
        <span>${escapeText(item.date)}</span>
        <span>${escapeText(item.topic)}</span>
        <span>Part ${position} of ${gaslightSeries.length}</span>
      </div>
    </header>
  `;
}

function renderSeriesIndex() {
  document.title = "GaslightCTF Series | Wisely";
  readerContent.innerHTML = `
    <section class="gaslight-series-index" aria-labelledby="gaslight-series-title">
      <h1 class="sr-only" id="gaslight-series-title">GaslightCTF writeups</h1>
      <div class="gaslight-series-grid" tabindex="0" aria-label="GaslightCTF writeup series">
        ${gaslightSeries.map((item, index) => `
          <a class="catalog-card gaslight-series-card" href="?challenge=${item.slug}">
            <div class="catalog-card-media is-wide-logo">
              <img src="../public/images/events/gaslightctf-logo.png" alt="GaslightCTF flame logo" width="600" height="350" loading="${index === 0 ? "eager" : "lazy"}">
              <span class="catalog-card-category">Part ${String(index + 1).padStart(2, "0")} / Web</span>
            </div>
            <div class="catalog-card-copy">
              <h2>${escapeText(item.title)}</h2>
              <p><span>GaslightCTF</span><strong>${escapeText(item.topic)}</strong></p>
            </div>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

async function loadMarkdown(item) {
  const response = await fetch(item.file, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${item.title}`);
  return response.text();
}

async function renderSingle(item) {
  const position = gaslightSeries.indexOf(item) + 1;
  const markdown = await loadMarkdown(item);
  document.title = `${item.title} — GaslightCTF | Wisely`;
  readerContent.innerHTML = `
    ${articleHeader(item, position)}
    <section class="writeup-section gaslight-markdown" aria-label="${escapeText(item.title)} writeup">
      ${renderMarkdown(markdown)}
    </section>
  `;
}

async function renderAll() {
  const markdownFiles = await Promise.all(gaslightSeries.map(loadMarkdown));
  document.title = "Read All — GaslightCTF Series | Wisely";
  readerContent.innerHTML = `
    <header class="writeup-title-block">
      <p class="eyebrow">GaslightCTF / Complete Series</p>
      <h1>Read All</h1>
      <div class="writeup-meta-row">
        <span>5 writeups</span>
        <span>Web</span>
        <span>GaslightCTF</span>
      </div>
    </header>
    ${gaslightSeries.map((item, index) => `
      <section class="gaslight-all-divider" id="${item.slug}">
        ${articleHeader(item, index + 1, 2)}
        <div class="writeup-section gaslight-markdown">
          ${renderMarkdown(markdownFiles[index])}
        </div>
      </section>
    `).join("")}
  `;
}

async function initGaslightReader() {
  document.body.classList.toggle("gaslight-series-index-view", !selectedChallenge);

  try {
    if (!selectedChallenge) {
      renderSeriesIndex();
    } else if (selectedChallenge === "all") {
      await renderAll();
    } else {
      const item = gaslightSeries.find((entry) => entry.slug === selectedChallenge);
      if (!item) throw new Error("Writeup not found");
      await renderSingle(item);
    }
    readerStatus.hidden = true;
  } catch (error) {
    readerStatus.textContent = "This writeup could not be loaded. Return to the series home and try again.";
    readerStatus.hidden = false;
  }
}

initGaslightReader();
