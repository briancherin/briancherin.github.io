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
const OUTPUT_META_FILE = path.join(OUTPUT_DIR, "newsletter-meta.json");
const NOTES_PREFIX = "src/site/notes/";
const DEFAULT_DAYS = 7;
const DEFAULT_MAX_LINES = 120;
const DEFAULT_MODE = "rendered";
const DEFAULT_SITE_BASE_URL = "";
const DEFAULT_TIME_ZONE = "America/New_York";
const MAX_CHARS_PER_SEGMENT = 420;
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

function normalizeSiteBaseUrl(raw) {
  if (!raw) return "";
  let base = String(raw).trim();
  if (!base) return "";
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  return base.replace(/\/+$/, "");
}

function toAbsoluteUrl(urlPath, siteBaseUrl) {
  const raw = String(urlPath || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!siteBaseUrl) return raw;
  if (raw.startsWith("/")) return `${siteBaseUrl}${raw}`;
  return `${siteBaseUrl}/${raw}`;
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
    created: parsed.data.created || "",
    updated: parsed.data.updated || "",
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
    const hasMeaningfulChange = current.lines.some(
      (line) =>
        (line.kind === "added" || line.kind === "removed") &&
        !isMetadataLine(line.text)
    );
    if (!hasMeaningfulChange) {
      current = null;
      return;
    }
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

function renderLineText(text) {
  if (!text || !String(text).trim()) return "";
  return md.render(String(text).trim());
}

function truncateText(text, maxChars = MAX_CHARS_PER_SEGMENT) {
  const raw = String(text || "").trim();
  if (raw.length <= maxChars) {
    return { text: raw, truncated: false };
  }
  const sliced = raw.slice(0, maxChars);
  const cutAt = sliced.lastIndexOf(" ");
  const safe = (cutAt > Math.floor(maxChars * 0.6) ? sliced.slice(0, cutAt) : sliced).trim();
  return { text: `${safe}...`, truncated: true };
}

function truncateFromStart(text, maxChars = MAX_CHARS_PER_SEGMENT) {
  const raw = String(text || "").trim();
  if (raw.length <= maxChars) {
    return { text: raw, truncated: false };
  }
  const tail = raw.slice(raw.length - maxChars);
  const firstSpace = tail.indexOf(" ");
  const safe = (firstSpace > 0 && firstSpace < Math.floor(maxChars * 0.4) ? tail.slice(firstSpace + 1) : tail).trim();
  return { text: `...${safe}`, truncated: true };
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: getTimeZone(),
  });
}

function formatDateTimeShort(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: getTimeZone(),
  });
}

function getTimeZone() {
  const tz = (getArg("time-zone") || process.env.NEWSLETTER_TIME_ZONE || DEFAULT_TIME_ZONE).trim();
  return tz || DEFAULT_TIME_ZONE;
}

function buildSegments(lines) {
  const segments = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    current.text = current.lines.map((line) => line.text).join("\n").trim();
    if (current.text) segments.push(current);
    current = null;
  };

  for (const line of lines) {
    if (!current || current.kind !== line.kind) {
      flush();
      current = { kind: line.kind, lines: [line], text: "" };
    } else {
      current.lines.push(line);
    }
  }
  flush();
  return segments;
}

function renderExcerptBlocksHtml(blocks, fullNoteUrl = "") {
  if (!blocks || blocks.length === 0) {
    return '<p class="muted">No meaningful content snippet found for this update.</p>';
  }

  const renderOneBlock = (block, style = "", suppressFirstSegmentTopBorder = false) => {
      const segments = buildSegments(block.lines);
      const rows = segments
        .map((segment, segIdx) => {
          const label = segment.kind === "added" ? "+" : segment.kind === "removed" ? "-" : "";
          const klass =
            segment.kind === "added"
              ? "seg seg-added"
              : segment.kind === "removed"
                ? "seg seg-removed"
                : "seg seg-context";
          const segmentStyle =
            segment.kind === "added"
              ? "padding:8px 10px;border-top:1px solid #e5e7eb;background:#ecfdf3;"
              : segment.kind === "removed"
                ? "padding:8px 10px;border-top:1px solid #e5e7eb;background:#fef2f2;"
                : "padding:8px 10px;border-top:1px solid #e5e7eb;background:#ffffff;";
          const segmentStyleFinal =
            suppressFirstSegmentTopBorder && segIdx === 0
              ? segmentStyle.replace("border-top:1px solid #e5e7eb;", "border-top:0;")
              : segmentStyle;
          const truncated =
            segment.kind === "context"
              ? truncateFromStart(segment.text)
              : truncateText(segment.text);
          return `<div class="${klass}">
            <div style="${segmentStyleFinal}">
              ${label ? `<div class="seg-label" style="font-size:12px;font-weight:700;line-height:1;margin-bottom:4px;color:#4b5563;">${label}</div>` : ""}
              <div class="seg-body" style="font-size:14px;line-height:1.6;color:#1f2937;">${renderLineText(truncated.text)}</div>
            </div>
          </div>`;
        })
        .join("\n");
      return `<div class="excerpt-block" style="border:1px solid #e5e7eb;background:#fbfdff;border-radius:6px;margin:8px 0;overflow:hidden;${style}">${rows}</div>`;
  };

  if (blocks.length <= 1) {
    return renderOneBlock(blocks[0]);
  }

  const omissionLink = fullNoteUrl
    ? ` &nbsp; <a href="${htmlEscape(fullNoteUrl)}" style="color:#0f5fba;text-decoration:none;font-weight:600;">Read full note</a>`
    : "";
  const omissionBar =
    `<div style="text-align:center;color:#6b7280;font-size:12px;font-style:italic;margin:0;padding:6px 0;background:#fbfdff;">&mdash; omitted unchanged content${omissionLink} &mdash;</div>`;

  const out = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const isBeforeGap = i < blocks.length - 1;
    const isAfterGap = i > 0;
    let style = "";
    if (isBeforeGap) {
      style += "margin-bottom:0;border-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0;";
    }
    if (isAfterGap) {
      style += "margin-top:0;border-top:0;border-top-left-radius:0;border-top-right-radius:0;";
    }
    out.push(renderOneBlock(blocks[i], style, isAfterGap));
    if (isBeforeGap) out.push(omissionBar);
  }
  return out.join("\n");
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
  const isNew = !oldRaw || !oldRaw.trim();
  const updatedDate = parseNoteMeta(file, newRaw).updated;
  const createdDate = parseNoteMeta(file, newRaw).created;

  return {
    file,
    meta: parseNoteMeta(file, newRaw),
    diff,
    excerptBlocks,
    changeType: isNew ? "new" : "updated",
    changedAt: updatedDate || createdDate || "",
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
        created: item.created || "",
        updated: item.updated || "",
      },
      diff,
      excerptBlocks: buildExcerptBlocksFromPatch(sourcePatch),
      changeType: item.changeType || "updated",
      changedAt: item.updated || item.created || "",
    };
  });

  return {
    windowStart: data.windowStart || `${DEFAULT_DAYS} days ago`,
    windowEnd: data.windowEnd || "now",
    items,
  };
}

function renderHtml(model, days, mode, maxLines, includeDebug, siteBaseUrl) {
  const cards = model.items.length
    ? model.items
        .map((item) => {
          const permalink = toAbsoluteUrl(item.meta.permalink, siteBaseUrl);
          const link = permalink
            ? `<p class="linkrow" style="margin-top:8px;margin-bottom:0;"><a href="${htmlEscape(permalink)}" style="color:#0f5fba;text-decoration:none;font-weight:600;">Read full note</a></p>`
            : "";
          const statusLabel = item.changeType === "new" ? "New note" : "Updated note";
          const changedDate = formatDate(item.changedAt);
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
<section class="card" style="border-top:1px solid #e5e7eb;padding-top:14px;margin-top:14px;">
  <div style="margin:0 0 6px 0;font-size:20px;line-height:1.3;color:#111827;font-weight:700;">${htmlEscape(item.meta.title)}</div>
  <div class="meta" style="margin:0 0 8px 0;color:#6b7280;font-size:13px;line-height:1.3;"><span class="badge" style="display:inline-block;padding:2px 7px;border-radius:999px;background:#e8f0fe;color:#1e40af;font-weight:600;font-size:12px;">${statusLabel}</span>${changedDate ? ` <span class="meta-date" style="color:#6b7280;">· ${changedDate}</span>` : ""}</div>
  ${renderExcerptBlocksHtml(item.excerptBlocks, permalink)}
  ${link}
  ${debug}
</section>`;
        })
        .join("\n")
    : `<div style="font-size:14px;color:#6b7280;">No note updates found in the last ${days} days.</div>`;

  return `
<!-- buttondown-editor-mode: fancy -->
<div style="color:#1f2937;">
  <div style="font-size:13px;color:#6b7280;line-height:1.4;margin:0 0 10px 0;">
    Updates from ${htmlEscape(formatDate(model.windowStart))} to ${htmlEscape(formatDate(model.windowEnd))} | Notes changed: ${model.items.length}
  </div>
  ${cards}
</div>`;
}

function main() {
  const days = toPositiveInt(getArg("days"), DEFAULT_DAYS);
  const maxLines = toPositiveInt(getArg("max-lines"), DEFAULT_MAX_LINES);
  const inputPath = getArg("input");
  const mode = getMode();
  const includeDebug = hasFlag("include-debug");
  const siteBaseUrl = normalizeSiteBaseUrl(
    getArg("site-base-url") || process.env.SITE_BASE_URL || DEFAULT_SITE_BASE_URL
  );

  const model = inputPath
    ? buildFromJson(inputPath, mode, maxLines)
    : buildFromGit(days, mode, maxLines);
  const html = renderHtml(model, days, mode, maxLines, includeDebug, siteBaseUrl);
  const meta = {
    generatedAt: new Date().toISOString(),
    days,
    mode,
    siteBaseUrl,
    windowStart: model.windowStart,
    windowEnd: model.windowEnd,
    itemsCount: model.items.length,
    outputHtml: path.relative(REPO_ROOT, OUTPUT_FILE),
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, html, "utf8");
  fs.writeFileSync(OUTPUT_COMPAT_FILE, html, "utf8");
  fs.writeFileSync(OUTPUT_META_FILE, JSON.stringify(meta, null, 2), "utf8");

  console.log(`Created ${OUTPUT_FILE}`);
  console.log(`Created ${OUTPUT_COMPAT_FILE}`);
  console.log(`Created ${OUTPUT_META_FILE}`);
  console.log(`Changed notes in last ${days} days: ${model.items.length}`);
  console.log(`Mode: ${mode}`);
}

main();
