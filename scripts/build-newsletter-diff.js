#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const REPO_ROOT = process.cwd();
const OUTPUT_DIR = path.join(REPO_ROOT, "dist");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "newsletter-weekly-email.html");
const OUTPUT_COMPAT_FILE = path.join(OUTPUT_DIR, "newsletter-weekly-preview.html");
const NOTES_PREFIX = "src/site/notes/";
const DEFAULT_DAYS = 7;
const DEFAULT_MAX_LINES = 120;
const DEFAULT_MODE = "rendered";
const ALLOWED_MODES = new Set(["rendered", "markdown"]);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
});

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function toPositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function runGitRaw(args, allowEmpty = false) {
  const result = spawnSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });

  if (typeof result.status !== "number") {
    if (allowEmpty) return "";
    throw new Error(
      "Node could not execute git subprocesses in this environment. " +
        "Run on a machine/CI where Node can spawn `git`."
    );
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    if (allowEmpty) return "";
    throw new Error(`git ${args.join(" ")} failed: ${stderr}`);
  }

  return result.stdout || "";
}

function runGit(args, allowEmpty = false) {
  return runGitRaw(args, allowEmpty).trim();
}

function getMode() {
  const requested = (getArg("mode") || DEFAULT_MODE).toLowerCase();
  return ALLOWED_MODES.has(requested) ? requested : DEFAULT_MODE;
}

function parseDiffPatch(patch, maxLines) {
  const lines = String(patch || "").split(/\r?\n/);
  const display = [];
  let hunks = 0;
  let added = 0;
  let removed = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      hunks += 1;
      display.push(line);
      continue;
    }
    if (
      line.startsWith("diff --git") ||
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ")
    ) {
      continue;
    }
    if (line.startsWith("+")) {
      added += 1;
      display.push(line);
      continue;
    }
    if (line.startsWith("-")) {
      removed += 1;
      display.push(line);
      continue;
    }
    if (line.startsWith(" ")) {
      display.push(line);
    }
  }

  const truncated = display.length > maxLines;
  return {
    hunks,
    added,
    removed,
    lines: truncated ? display.slice(0, maxLines) : display,
    truncated,
  };
}

function parseNoteMeta(filePath, rawContent = "") {
  if (!rawContent) {
    return {
      title: path.basename(filePath, ".md"),
      permalink: "",
    };
  }
  const parsed = matter(rawContent);
  return {
    title: parsed.data.title || path.basename(filePath, ".md"),
    permalink: parsed.data.permalink || "",
  };
}

function renderNoteBodyToHtml(noteRaw) {
  const parsed = matter(noteRaw || "");
  return md.render(parsed.content || "");
}

function diffTextAsPatch(oldText, newText) {
  const oldLines = String(oldText || "").split(/\r?\n/);
  const newLines = String(newText || "").split(/\r?\n/);
  const out = [];
  let i = 0;
  let j = 0;

  const hasAhead = (lines, idx, value, maxLookahead = 12) => {
    const end = Math.min(lines.length, idx + maxLookahead);
    for (let k = idx; k < end; k += 1) {
      if (lines[k] === value) return true;
    }
    return false;
  };

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      i += 1;
      j += 1;
      continue;
    }

    out.push(`@@ -${i + 1},0 +${j + 1},0 @@`);
    let steps = 0;
    while ((i < oldLines.length || j < newLines.length) && steps < 500) {
      if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
        break;
      }
      const oldCurrent = i < oldLines.length ? oldLines[i] : null;
      const newCurrent = j < newLines.length ? newLines[j] : null;

      if (oldCurrent !== null && newCurrent !== null) {
        if (!hasAhead(newLines, j, oldCurrent) && hasAhead(oldLines, i, newCurrent)) {
          out.push(`-${oldCurrent}`);
          i += 1;
        } else {
          out.push(`+${newCurrent}`);
          j += 1;
        }
        steps += 1;
        continue;
      }

      if (oldCurrent !== null) {
        out.push(`-${oldCurrent}`);
        i += 1;
      }
      if (newCurrent !== null) {
        out.push(`+${newCurrent}`);
        j += 1;
      }
      steps += 1;
    }
  }

  return out.join("\n");
}

function isMetadataLine(text) {
  const t = String(text || "").trim();
  if (!t) return false;
  if (t === "---") return true;
  if (t.startsWith("{") && t.includes("\"dg-publish\"")) return true;
  if (t.includes("\"updated\"")) return true;
  if (t.includes("\"created\"")) return true;
  return false;
}

function buildExcerptBlocksFromPatch(patch, maxBlocks = 2, maxLinesPerBlock = 14) {
  const lines = String(patch || "").split(/\r?\n/);
  const blocks = [];
  let current = null;

  const pushCurrent = () => {
    if (!current || current.lines.length === 0) return;
    const filtered = current.lines.filter((line) => !isMetadataLine(line.text));
    if (filtered.length > 0) {
      blocks.push({ lines: filtered.slice(0, maxLinesPerBlock) });
    }
    current = null;
  };

  for (const line of lines) {
    if (line.startsWith("@@")) {
      pushCurrent();
      current = { lines: [] };
      continue;
    }
    if (!current) continue;
    if (
      line.startsWith("diff --git") ||
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ")
    ) {
      continue;
    }
    if (line.startsWith(" ") || line.startsWith("+") || line.startsWith("-")) {
      const kind = line[0] === "+" ? "added" : line[0] === "-" ? "removed" : "context";
      current.lines.push({
        kind,
        text: line.slice(1),
      });
    }
  }
  pushCurrent();

  return blocks.slice(0, maxBlocks);
}

function renderExcerptBlocksHtml(blocks) {
  if (!blocks || blocks.length === 0) {
    return '<p class="muted">No meaningful content snippet found for this update.</p>';
  }

  return blocks
    .map((block, idx) => {
      const rows = block.lines
        .map((line) => {
          const klass =
            line.kind === "added" ? "ln-added" : line.kind === "removed" ? "ln-removed" : "ln-context";
          const prefix = line.kind === "added" ? "+" : line.kind === "removed" ? "-" : " ";
          const body = line.text.trim()
            ? md.renderInline(line.text)
            : "&nbsp;";
          return `<div class="ln ${klass}"><span class="pf">${prefix}</span><span class="tx">${body}</span></div>`;
        })
        .join("\n");
      return `<div class="excerpt-block"><div class="excerpt-head">Context ${idx + 1}</div>${rows}</div>`;
    })
    .join("\n");
}

function buildItemFromGit(range, file, mode, maxLines) {
  const newRaw = runGitRaw(["show", `HEAD:${file}`], true);
  const oldRaw = runGitRaw(["show", `${range.split("..")[0]}:${file}`], true);
  const sourcePatch = runGitRaw(["diff", "--unified=3", range, "--", file], true);

  let debugPatch = sourcePatch;
  if (mode === "rendered") {
    const oldHtml = renderNoteBodyToHtml(oldRaw);
    const newHtml = renderNoteBodyToHtml(newRaw);
    debugPatch = diffTextAsPatch(oldHtml, newHtml);
  }

  const diff = parseDiffPatch(debugPatch, maxLines);
  const excerptBlocks = buildExcerptBlocksFromPatch(sourcePatch);
  if (diff.hunks === 0 && diff.added === 0 && diff.removed === 0) return null;

  return {
    file,
    meta: parseNoteMeta(file, newRaw),
    diff,
    excerptBlocks,
  };
}

function buildFromGit(days, mode, maxLines) {
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  console.log(`[newsletter] now=${new Date().toISOString()} days=${days} since=${sinceIso}`);

  let base = runGit(["rev-list", "-1", `--before=${sinceIso}`, "HEAD"], true);
  console.log(`[newsletter] base_before_since=${base || "(none)"}`);
  if (!base) {
    base = runGit(["rev-list", "--max-parents=0", "HEAD"], true)
      .split(/\r?\n/)
      .filter(Boolean)[0];
    console.log(`[newsletter] fallback_root_base=${base || "(none)"}`);
  }
  if (!base) {
    console.log("[newsletter] no commits found in repository history.");
    return { windowStart: `${days} days ago`, windowEnd: "now", items: [] };
  }

  const range = `${base}..HEAD`;
  console.log(`[newsletter] range=${range}`);
  const windowStart = runGit(["show", "-s", "--format=%cI", base], true) || `${days} days ago`;
  const windowEnd = runGit(["show", "-s", "--format=%cI", "HEAD"], true) || "now";
  console.log(`[newsletter] window_start=${windowStart} window_end=${windowEnd}`);

  const files = runGit(["diff", "--name-only", "--diff-filter=AM", range], true)
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((p) => p.startsWith(NOTES_PREFIX) && p.endsWith(".md"));
  console.log(`[newsletter] changed_note_files=${files.length}`);
  if (files.length > 0) {
    for (const file of files.slice(0, 20)) {
      console.log(`[newsletter] note_file=${file}`);
    }
    if (files.length > 20) {
      console.log(`[newsletter] note_file_more=${files.length - 20}`);
    }
  }

  const items = [];
  for (const file of files) {
    const item = buildItemFromGit(range, file, mode, maxLines);
    if (item) items.push(item);
  }
  console.log(`[newsletter] items_with_diff=${items.length}`);

  return { windowStart, windowEnd, items };
}

function buildFromJson(inputPath, mode, maxLines) {
  const raw = fs.readFileSync(path.resolve(REPO_ROOT, inputPath), "utf8");
  const data = JSON.parse(raw);
  const items = (data.items || []).map((item) => {
    const sourcePatch =
      item.patchWithContext ||
      item.patch ||
      (() => {
        const oldMd = item.oldMarkdown || "";
        const newMd = item.newMarkdown || "";
        return diffTextAsPatch(oldMd, newMd);
      })();

    let debugPatch = sourcePatch;
    if (mode === "rendered" && (item.oldMarkdown || item.newMarkdown)) {
      debugPatch = diffTextAsPatch(
        md.render(item.oldMarkdown || ""),
        md.render(item.newMarkdown || "")
      );
    }

    const diff = parseDiffPatch(debugPatch, maxLines);
    return {
      file: item.file || "unknown.md",
      meta: {
        title: item.title || path.basename(item.file || "unknown.md", ".md"),
        permalink: item.permalink || "",
      },
      diff,
      excerptBlocks: buildExcerptBlocksFromPatch(sourcePatch),
    };
  });

  return {
    windowStart: data.windowStart || `${DEFAULT_DAYS} days ago`,
    windowEnd: data.windowEnd || "now",
    items,
  };
}

function renderHtml(model, days, mode, maxLines, includeDebug) {
  const cards = model.items.length
    ? model.items
        .map((item) => {
          const link = item.meta.permalink
            ? `<p class="linkrow"><a href="${htmlEscape(item.meta.permalink)}">Read full note</a></p>`
            : "";
          const debug = includeDebug
            ? (() => {
                const lines = item.diff.lines
                  .map((line) => {
                    const cls = line.startsWith("+")
                      ? "plus"
                      : line.startsWith("-")
                        ? "minus"
                        : "ctx";
                    return `<span class="${cls}">${htmlEscape(line)}</span>`;
                  })
                  .join("\n");
                return `<details><summary>Debug diff</summary><pre>${lines || "(no diff lines)"}</pre></details>`;
              })()
            : "";

          return `
<section class="card">
  <h2>${htmlEscape(item.meta.title)}</h2>
  <p class="meta">Updated excerpt from ${htmlEscape(item.file)} | +${item.diff.added} / -${item.diff.removed}</p>
  ${renderExcerptBlocksHtml(item.excerptBlocks)}
  ${link}
  ${debug}
</section>`;
        })
        .join("\n")
    : `<p>No note updates found in the last ${days} days.</p>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Weekly Garden Updates</title>
  <style>
    body { margin: 0; padding: 24px; background: #f2f3f5; color: #1f2937; font-family: Georgia, serif; }
    .container { max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; }
    h1 { margin: 0 0 8px 0; font-size: 30px; }
    .sub { margin: 0 0 22px 0; color: #4b5563; font-size: 14px; }
    .card { border-top: 1px solid #e5e7eb; padding-top: 18px; margin-top: 18px; }
    h2 { margin: 0 0 8px 0; font-size: 22px; }
    .meta { margin: 0 0 10px 0; color: #6b7280; font-size: 13px; }
    .linkrow { margin-top: 12px; }
    .linkrow a { color: #0f5fba; text-decoration: none; font-weight: 600; }
    .excerpt-block { border: 1px solid #e5e7eb; background: #fbfdff; border-radius: 8px; margin: 10px 0; }
    .excerpt-head { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; background: #f9fafb; }
    .ln { display: flex; gap: 8px; padding: 6px 10px; font-size: 14px; line-height: 1.5; }
    .pf { width: 10px; color: #6b7280; font-family: Consolas, monospace; }
    .tx { flex: 1; word-break: break-word; }
    .ln-context { background: #ffffff; }
    .ln-added { background: #ecfdf3; }
    .ln-removed { background: #fef2f2; color: #7f1d1d; }
    .muted { color: #6b7280; font-size: 13px; }
    details { margin-top: 12px; }
    pre { background: #0f172a; color: #e5e7eb; padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; line-height: 1.45; }
    .plus { color: #86efac; display: block; }
    .minus { color: #fca5a5; display: block; }
    .ctx { color: #cbd5e1; display: block; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Weekly Garden Updates</h1>
    <p class="sub">Window: ${htmlEscape(model.windowStart)} to ${htmlEscape(model.windowEnd)} | Notes changed: ${model.items.length} | Mode: ${htmlEscape(mode)}${includeDebug ? " | Debug on" : ""}</p>
    ${cards}
  </div>
</body>
</html>`;
}

function main() {
  const days = toPositiveInt(getArg("days"), DEFAULT_DAYS);
  const maxLines = toPositiveInt(getArg("max-lines"), DEFAULT_MAX_LINES);
  const inputPath = getArg("input");
  const mode = getMode();
  const includeDebug = hasFlag("include-debug");

  const model = inputPath
    ? buildFromJson(inputPath, mode, maxLines)
    : buildFromGit(days, mode, maxLines);
  const html = renderHtml(model, days, mode, maxLines, includeDebug);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, html, "utf8");
  fs.writeFileSync(OUTPUT_COMPAT_FILE, html, "utf8");

  console.log(`Created ${OUTPUT_FILE}`);
  console.log(`Created ${OUTPUT_COMPAT_FILE}`);
  console.log(`Changed notes in last ${days} days: ${model.items.length}`);
  console.log(`Mode: ${mode}`);
}

main();
