// Shared markdown reader for standalone writeup pages.
// Each page defines window.WRITEUP_PAGE = { eyebrow, title, description, date, topic, tags, file, imageFolder }
// Markdown conventions (same as the GaslightCTF reader, plus a few extras):
//   ![[file.png]]        -> image from public/images/writeups/<imageFolder>/
//   ![[https://...]]     -> external image URL
//   caption line directly under an image -> figure caption
//   ## / ###             -> section headings
//   - item / 1. item     -> lists (indented lines continue the previous item)
//   > text               -> note callout
//   > `flag{...}`        -> highlighted flag block

const writeupPage = window.WRITEUP_PAGE || null;
const readerContent = document.querySelector("#writeup-reader-content");
const readerStatus = document.querySelector("#writeup-reader-status");

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
    const token = `@@MD_TOKEN_${tokens.length}@@`;
    tokens.push(html);
    return token;
  };

  output = output.replace(/`([^`]+)`/g, (_, code) => preserve(`<code>${code}</code>`));
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => (
    preserve(`<a href="${url}" rel="noreferrer">${label}</a>`)
  ));
  output = output.replace(/(^|[\s(])(https?:\/\/[^\s<]+)/g, (_, prefix, url) => (
    `${prefix}${preserve(`<a href="${url}" rel="noreferrer">${url}</a>`)}`
  ));

  tokens.forEach((html, index) => {
    output = output.replace(`@@MD_TOKEN_${index}@@`, html);
  });

  return output;
}

function highlightCode(value) {
  const tokenPattern = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|from|export|default|const|let|var|function|return|if|else|elif|for|while|try|catch|except|throw|new|class|extends|async|await|interface|type|as|in|of|def|lambda|with|yield|and|or|not|is|pass|break|continue)\b|\b(?:true|false|null|undefined|None|True|False)\b|\b\d+(?:\.\d+)?\b/g;
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

function isBlockStart(line) {
  return /^(!\[\[|```|#{1,3}\s|>|\s*[-*]\s|\s*\d+[.)]\s)/.test(line);
}

function figureHtml(source, caption, imageFolder) {
  const external = /^https?:\/\//.test(source);
  const src = external
    ? source
    : `../public/images/writeups/${encodeURIComponent(imageFolder)}/${encodeURIComponent(source)}`;
  const alt = external ? "Illustration" : source.replace(/\.[^.]+$/, "");

  return `
    <figure>
      <img src="${escapeText(src)}" alt="${escapeText(alt)}" loading="lazy">
      ${caption ? `<figcaption>${renderInlineMarkdown(caption)}</figcaption>` : ""}
    </figure>
  `;
}

function peekCaption(lines, index) {
  if (index + 1 >= lines.length) return { caption: "", next: index };
  const next = lines[index + 1].trim();
  if (next && !isBlockStart(next)) {
    return { caption: next, next: index + 1 };
  }
  return { caption: "", next: index };
}

function renderMarkdown(markdown, imageFolder) {
  const lines = markdown
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "  ")
    .split("\n");
  const blocks = [];
  let paragraph = [];
  let code = [];
  let codeLanguage = "";
  let inCode = false;
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${renderInlineMarkdown(paragraph.join("\n"))}</p>`);
    paragraph = [];
  };

  const renderListItem = (item) => `
    <li>
      ${item.text.map((line) => `<p>${renderInlineMarkdown(line)}</p>`).join("\n")}
      ${item.figures.join("\n")}
    </li>
  `;

  const flushList = () => {
    if (!list) return;
    const tag = list.ordered ? "ol" : "ul";
    blocks.push(`<${tag}>${list.items.map(renderListItem).join("")}</${tag}>`);
    list = null;
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    const fence = line.match(/^```\s*(.*)$/);
    if (fence) {
      if (inCode) {
        blocks.push(`<pre><code${codeLanguage ? ` class="language-${escapeText(codeLanguage)}"` : ""}>${highlightCode(code.join("\n"))}</code></pre>`);
        code = [];
        codeLanguage = "";
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        codeLanguage = fence[1].trim();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    const image = line.match(/^\s*!\[\[([^\]]+)\]\]\s*$/);
    if (image) {
      flushParagraph();
      const { caption, next } = peekCaption(lines, index);
      const figure = figureHtml(image[1].trim(), caption, imageFolder);
      if (list && list.items.length) {
        list.items[list.items.length - 1].figures.push(figure);
      } else {
        blocks.push(figure);
      }
      index = next;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      const quoted = [quote[1]];
      while (index + 1 < lines.length) {
        const continuation = lines[index + 1].match(/^>\s?(.*)$/);
        if (!continuation) break;
        quoted.push(continuation[1]);
        index++;
      }
      const content = quoted.join("\n").trim();
      const flag = content.match(/^`([^`]+)`$/);
      if (flag) {
        blocks.push(`
          <section class="writeup-section writeup-flag">
            <p class="eyebrow">Flag</p>
            <code>${escapeText(flag[1])}</code>
          </section>
        `);
      } else {
        blocks.push(`<blockquote>${renderInlineMarkdown(content)}</blockquote>`);
      }
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (unordered || ordered) {
      flushParagraph();
      const wantsOrdered = Boolean(ordered);
      if (!list || list.ordered !== wantsOrdered) {
        flushList();
        list = { ordered: wantsOrdered, items: [] };
      }
      list.items.push({ text: [unordered ? unordered[1] : ordered[1]], figures: [] });
      continue;
    }

    if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1].text.push(line.trim());
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  if (inCode) {
    blocks.push(`<pre><code${codeLanguage ? ` class="language-${escapeText(codeLanguage)}"` : ""}>${highlightCode(code.join("\n"))}</code></pre>`);
  }
  flushParagraph();
  flushList();
  return blocks.join("\n");
}

function renderPageHeader() {
  const tags = (writeupPage.tags || []).map((tag) => `<span>${escapeText(tag)}</span>`).join("");
  return `
    <header class="writeup-title-block">
      <p class="eyebrow">${escapeText(writeupPage.eyebrow || "Writeup")}</p>
      <h1>${escapeText(writeupPage.title)}</h1>
      ${writeupPage.description ? `<p>${escapeText(writeupPage.description)}</p>` : ""}
      <div class="writeup-meta-row">
        <span>${escapeText(writeupPage.date || "")}</span>
        <span>${escapeText(writeupPage.topic || "")}</span>
        ${tags}
      </div>
    </header>
  `;
}

async function initWriteupReader() {
  if (!writeupPage || !readerContent) return;

  try {
    const response = await fetch(writeupPage.file, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load writeup markdown");

    const markdown = await response.text();
    document.title = `${writeupPage.title} Writeup | Wisely`;
    readerContent.innerHTML = `
      ${renderPageHeader()}
      <section class="writeup-section writeup-section--plain gaslight-markdown" aria-label="${escapeText(writeupPage.title)} writeup">
        ${renderMarkdown(markdown, writeupPage.imageFolder || "")}
      </section>
    `;
    if (readerStatus) readerStatus.hidden = true;
  } catch (error) {
    if (readerStatus) {
      readerStatus.textContent = "This writeup could not be loaded. Return to the catalog and try again.";
      readerStatus.hidden = false;
    }
  }
}

initWriteupReader();
