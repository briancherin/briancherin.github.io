#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const slugify = require("@sindresorhus/slugify");
const { headerToId } = require("../src/helpers/utils");

const REPO_ROOT = process.cwd();
const OUTPUT_DIR = path.join(REPO_ROOT, "dist");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "newsletter-weekly-email.html");
const OUTPUT_COMPAT_FILE = path.join(OUTPUT_DIR, "newsletter-weekly-preview.html");
const OUTPUT_META_FILE = path.join(OUTPUT_DIR, "newsletter-meta.json");
const NOTES_PREFIX = "src/site/notes/";
const DEFAULT_DAYS = 7;
const DEFAULT_MAX_LINES = 120;
const DEFAULT_MODE = "rendered";
const DEFAULT_SITE_BASE_URL = "https://garden.briancher.in";
const DEFAULT_TIME_ZONE = "America/New_York";
const MAX_CHARS_PER_SEGMENT = 1000;
const ALLOWED_MODES = new Set(["rendered", "markdown"]);
const SPOILER_TAG_RE = /^\s*(?:>+\s*)?\[!DANGER\]\s*Spoilers ahead\.?\s*$/i;
const SPOILER_END_TAG_RE = /^\s*(?:>+\s*)?\[!success\]\s*End of spoilers\.?\s*$/i;
const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;
const noteLinkCache = new Map();

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

function splitWikilinkTarget(rawTarget) {
  const target = String(rawTarget || "");
  const pipeIndex = target.indexOf("|");
  if (pipeIndex >= 0) {
    return [target.slice(0, pipeIndex), target.slice(pipeIndex + 1)];
  }
  return [target, ""];
}

function cleanWikilinkPart(value) {
  return String(value || "").replace(/\\\|/g, "|").replace(/\\/g, "").trim();
}

function resolveNotePermalink(filePath) {
  const fileName = String(filePath || "").replaceAll("&amp;", "&").trim();
  if (!fileName) return "/404";
  if (noteLinkCache.has(fileName)) return noteLinkCache.get(fileName);

  const fullPath = path.join(
    REPO_ROOT,
    NOTES_PREFIX,
    fileName.endsWith(".md") ? fileName : `${fileName}.md`
  );
  let permalink = "/404";
  try {
    const parsed = matter(fs.readFileSync(fullPath, "utf8"));
    permalink = parsed.data.permalink || `/notes/${slugify(fileName)}`;
    if (parsed.data.tags && parsed.data.tags.indexOf("gardenEntry") !== -1) {
      permalink = "/";
    }
  } catch {
    permalink = "/404";
  }

  noteLinkCache.set(fileName, permalink);
  return permalink;
}

function renderWikilinksAsHtml(text, siteBaseUrl = "") {
  return String(text || "").replace(WIKILINK_RE, (match, rawTarget) => {
    if (rawTarget.includes("],[") || rawTarget.includes('"$"')) {
      return match;
    }

    const [rawFileLink, rawTitle] = splitWikilinkTarget(rawTarget);
    const fileLink = cleanWikilinkPart(rawFileLink);
    const title = cleanWikilinkPart(rawTitle) || fileLink;
    let fileName = fileLink;
    let headerLinkPath = "";

    if (fileLink.includes("#")) {
      const parts = fileLink.split("#");
      fileName = parts.shift();
      headerLinkPath = `#${headerToId(parts.join("#"))}`;
    }

    const href = toAbsoluteUrl(`${resolveNotePermalink(fileName)}${headerLinkPath}`, siteBaseUrl);
    return `<a href="${htmlEscape(href)}">${htmlEscape(title)}</a>`;
  });
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
      dgPath: "",
    };
  }
  const parsed = matter(rawContent);
  return {
    title: parsed.data.title || path.basename(filePath, ".md"),
    permalink: parsed.data.permalink || "",
    created: parsed.data.created || "",
    updated: parsed.data.updated || "",
    dgPath: parsed.data["dg-path"] || "",
  };
}

function getNoteFolderPathParts(filePath, meta = {}) {
  const dgPath = String(meta.dgPath || "").trim();
  const notePath = dgPath || String(filePath || "").replace(/\\/g, "/").replace(NOTES_PREFIX, "");
  const parts = notePath.split("/").filter(Boolean);
  if (parts.length <= 1) return [];
  parts.pop();
  return parts;
}

function renderFolderBreadcrumbHtml(filePath, meta = {}) {
  const parts = getNoteFolderPathParts(filePath, meta);
  if (!parts.length) return "";
  const breadcrumb = parts.map(htmlEscape).join(" &gt; ");
  return `<div class="note-folder-path" style="margin:-2px 0 8px 0;color:#6b7280;font-size:13px;line-height:1.35;font-style:italic;">${breadcrumb}</div>`;
}

function getItemSortTime(item) {
  const raw = item?.changedAt || item?.meta?.updated || item?.meta?.created || "";
  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortItemsMostRecentlyUpdated(items) {
  return [...items].sort((a, b) => {
    const diff = getItemSortTime(b) - getItemSortTime(a);
    if (diff !== 0) return diff;
    return String(a.file || "").localeCompare(String(b.file || ""));
  });
}

function stripAfterSpoilerTag(noteRaw) {
  const parsed = matter(noteRaw || "");
  const content = String(parsed.content || "");
  const lines = content.split(/\r?\n/);
  const startIdx = lines.findIndex((line) => SPOILER_TAG_RE.test(String(line || "").trim()));
  if (startIdx === -1) {
    return { raw: noteRaw || "", content, omittedSpoilers: false };
  }

  let endIdx = -1;
  for (let i = startIdx + 1; i < lines.length; i += 1) {
    if (SPOILER_END_TAG_RE.test(String(lines[i] || "").trim())) {
      endIdx = i;
      break;
    }
  }

  const omittedSlice =
    endIdx === -1 ? lines.slice(startIdx + 1) : lines.slice(startIdx + 1, endIdx);
  const omittedSpoilers = omittedSlice.some((line) => String(line || "").trim().length > 0);

  const before = lines.slice(0, startIdx);
  const after = endIdx === -1 ? [] : lines.slice(endIdx + 1);
  const safeContent = [...before, ...after].join("\n").replace(/\s+$/, "");
  const rebuiltRaw = matter.stringify(safeContent, parsed.data || {});
  return { raw: rebuiltRaw, content: safeContent, omittedSpoilers };
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

function renderLineText(text, siteBaseUrl = "") {
  if (!text || !String(text).trim()) return "";
  return md.render(renderWikilinksAsHtml(String(text).trim(), siteBaseUrl));
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

function countWords(text) {
  const s = String(text || "").trim();
  if (!s) return 0;
  return s.split(/\s+/).filter(Boolean).length;
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

function truncateContextByPosition(text, segIdx, segments) {
  const prevChangeIdx = (() => {
    for (let i = segIdx - 1; i >= 0; i -= 1) {
      if (segments[i].kind !== "context") return i;
    }
    return -1;
  })();
  const nextChangeIdx = (() => {
    for (let i = segIdx + 1; i < segments.length; i += 1) {
      if (segments[i].kind !== "context") return i;
    }
    return -1;
  })();

  // Context before a change: keep tail nearest the change.
  if (prevChangeIdx === -1 && nextChangeIdx !== -1) {
    return truncateFromStart(text);
  }
  // Context after a change: keep beginning nearest the change.
  if (prevChangeIdx !== -1 && nextChangeIdx === -1) {
    return truncateText(text);
  }
  // Context between changes: bias to whichever change is closer.
  if (prevChangeIdx !== -1 && nextChangeIdx !== -1) {
    const distPrev = segIdx - prevChangeIdx;
    const distNext = nextChangeIdx - segIdx;
    return distPrev <= distNext ? truncateText(text) : truncateFromStart(text);
  }
  // No surrounding changes (unlikely); leave as-is.
  return { text: String(text || "").trim(), truncated: false };
}

function normalizeForComparison(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim()
    .toLowerCase();
}

function commonPrefixRatio(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  if (!x || !y) return 0;
  const minLen = Math.min(x.length, y.length);
  let i = 0;
  while (i < minLen && x[i] === y[i]) i += 1;
  return i / minLen;
}

function shouldSuppressRemovedAgainstAdded(removedText, addedText) {
  const removedNorm = normalizeForComparison(removedText);
  const addedNorm = normalizeForComparison(addedText);
  if (!removedNorm || !addedNorm) return false;

  // Exact normalized match: pure replace noise.
  if (removedNorm === addedNorm) return true;

  // Case 1: one is a clear expansion of the other.
  if (addedNorm.includes(removedNorm) || removedNorm.includes(addedNorm)) return true;

  // Case 2: nearly identical starts (tiny edit + continuation).
  const prefix = commonPrefixRatio(removedNorm, addedNorm);
  if (prefix >= 0.92) return true;

  // Case 3: long paragraphs with extremely similar starts.
  if (removedNorm.length > 140 && addedNorm.length > 140 && prefix >= 0.85) return true;

  // Case 4: exact same opening chunk (git split noise around long lines).
  const HEAD = 120;
  if (removedNorm.length > HEAD && addedNorm.length > HEAD) {
    if (removedNorm.slice(0, HEAD) === addedNorm.slice(0, HEAD)) return true;
  }

  return false;
}

function simplifySegments(segments) {
  const out = [];
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    if (seg.kind === "removed") {
      // Structured pass: look ahead through nearby context to find the paired added segment.
      // Stop when we hit another removed block, which usually indicates a new change region.
      let candidateAdded = null;
      for (let j = i + 1; j < segments.length; j += 1) {
        const probe = segments[j];
        if (probe.kind === "added") {
          candidateAdded = probe;
          break;
        }
        if (probe.kind === "removed") {
          break;
        }
        // keep scanning across context segments
      }

      if (candidateAdded && shouldSuppressRemovedAgainstAdded(seg.text, candidateAdded.text)) {
        continue;
      }
    }
    out.push(seg);
  }
  // Keep leading context, but drop trailing context after the last change.
  let lastChange = -1;
  for (let i = 0; i < out.length; i += 1) {
    if (out[i].kind !== "context") lastChange = i;
  }
  if (lastChange === -1) return out;
  return out.filter((seg, idx) => !(seg.kind === "context" && idx > lastChange));
}

function renderExcerptBlocksHtml(blocks, fullNoteUrl = "", options = {}) {
  const spoilerOmitted = Boolean(options.spoilerOmitted);
  const noteWordCount = Number(options.noteWordCount || 0);
  const siteBaseUrl = options.siteBaseUrl || "";
  if (!blocks || blocks.length === 0) {
    return spoilerOmitted ? "" : '<p class="muted">No meaningful content snippet found for this update.</p>';
  }

  const visibleWordsInNote = blocks.reduce((sum, block) => {
    const segments = simplifySegments(buildSegments(block.lines));
    return (
      sum +
      segments.reduce((acc, seg, segIdx) => {
        if (seg.kind === "removed") return acc;
        const truncated =
          seg.kind === "context"
            ? truncateContextByPosition(seg.text, segIdx, segments)
            : truncateText(seg.text);
        return acc + countWords(truncated.text);
      }, 0)
    );
  }, 0);
  const remainingWordsInNote = Math.max(noteWordCount - visibleWordsInNote, 0);

  const renderOneBlock = (block, style = "", suppressFirstSegmentTopBorder = false) => {
      const segments = simplifySegments(buildSegments(block.lines));
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
              ? "padding:0;border-top:1px solid #e5e7eb;background:#ecfdf3;"
              : segment.kind === "removed"
                ? "padding:0;border-top:1px solid #e5e7eb;background:#fef2f2;"
                : "padding:0;border-top:1px solid #e5e7eb;background:#ffffff;";
          const segmentStyleFinal =
            suppressFirstSegmentTopBorder && segIdx === 0
              ? segmentStyle.replace("border-top:1px solid #e5e7eb;", "border-top:0;")
              : segmentStyle;
          const truncated =
            segment.kind === "context"
              ? truncateContextByPosition(segment.text, segIdx, segments)
              : truncateText(segment.text);
          const moreWordsHint =
            segment.kind === "added" && truncated.truncated && remainingWordsInNote > 0
              ? `<div style="margin-top:6px;font-size:12px;line-height:1.3;color:#6b7280;font-style:italic;">... plus about ${remainingWordsInNote} more words in this note</div>`
              : "";
          return `<div class="${klass}">
            <div style="${segmentStyleFinal}">
              ${label ? `<div class="seg-label" style="font-size:12px;font-weight:700;line-height:1;margin:0 0 4px 0;color:#4b5563;">${label}</div>` : ""}
              <div class="seg-body" style="font-size:14px;line-height:1.6;color:#1f2937;">${renderLineText(truncated.text, siteBaseUrl)}${moreWordsHint}</div>
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
  const newRawOriginal = runGitRaw(["show", `HEAD:${file}`], true);
  const oldRawOriginal = runGitRaw(["show", `${range.split("..")[0]}:${file}`], true);
  const sourcePatchOriginal = runGitRaw(["diff", "--unified=3", range, "--", file], true);
  const oldParsed = matter(oldRawOriginal || "");
  const newParsed = matter(newRawOriginal || "");
  const newSafe = stripAfterSpoilerTag(newRawOriginal);
  const oldSafe = stripAfterSpoilerTag(oldRawOriginal);
  const newRaw = newSafe.raw;
  const oldRaw = oldSafe.raw;
  const sourcePatch = diffTextAsPatch(oldSafe.content || "", newSafe.content || "");

  let debugPatch = sourcePatch;
  if (mode === "rendered") {
    const oldHtml = md.render(oldSafe.content || "");
    const newHtml = md.render(newSafe.content || "");
    debugPatch = diffTextAsPatch(oldHtml, newHtml);
  }

  const diff = parseDiffPatch(debugPatch, maxLines);
  const excerptBlocks = buildExcerptBlocksFromPatch(sourcePatch);
  const rawDiff = parseDiffPatch(sourcePatchOriginal, maxLines);
  const spoilerOmitted = newSafe.omittedSpoilers;
  if (
    diff.hunks === 0 &&
    diff.added === 0 &&
    diff.removed === 0 &&
    oldSafe.content === newSafe.content &&
    !(spoilerOmitted && (oldParsed.content || "") !== (newParsed.content || ""))
  ) {
    return null;
  }
  const isNew = !oldRaw || !oldRaw.trim();
  const meta = parseNoteMeta(file, newRaw);
  const gitUpdatedDate = runGit(["log", "-1", "--format=%cI", "--", file], true);

  return {
    file,
    meta,
    diff,
    excerptBlocks,
    changeType: isNew ? "new" : "updated",
    changedAt: gitUpdatedDate || "",
    spoilerOmitted,
    noteWordCount: countWords(newSafe.content || ""),
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
  const sortedItems = sortItemsMostRecentlyUpdated(items);
  console.log(`[newsletter] items_with_diff=${items.length}`);

  return { windowStart, windowEnd, items: sortedItems };
}

function buildFromJson(inputPath, mode, maxLines) {
  const raw = fs.readFileSync(path.resolve(REPO_ROOT, inputPath), "utf8");
  const data = JSON.parse(raw);
  const items = (data.items || []).map((item) => {
    const oldSafe = stripAfterSpoilerTag(item.oldMarkdown || "");
    const newSafe = stripAfterSpoilerTag(item.newMarkdown || "");
    const sourcePatch = diffTextAsPatch(oldSafe.content || "", newSafe.content || "");

    let debugPatch = sourcePatch;
    if (mode === "rendered" && (item.oldMarkdown || item.newMarkdown)) {
      debugPatch = diffTextAsPatch(
        md.render(oldSafe.content || ""),
        md.render(newSafe.content || "")
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
        dgPath: item.dgPath || item["dg-path"] || "",
      },
      diff,
      excerptBlocks: buildExcerptBlocksFromPatch(sourcePatch),
      changeType: item.changeType || "updated",
      changedAt: item.updated || item.created || "",
      spoilerOmitted: Boolean(newSafe.omittedSpoilers || item.spoilerOmitted),
      noteWordCount: countWords(newSafe.content || ""),
    };
  });

  return {
    windowStart: data.windowStart || `${DEFAULT_DAYS} days ago`,
    windowEnd: data.windowEnd || "now",
    items: sortItemsMostRecentlyUpdated(items),
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
          const titleHtml = permalink
            ? `<a href="${htmlEscape(permalink)}" style="color:#111827;text-decoration:none;">${htmlEscape(item.meta.title)}</a>`
            : htmlEscape(item.meta.title);
          const folderBreadcrumb = renderFolderBreadcrumbHtml(item.file, item.meta);
          const statusLabel = item.changeType === "new" ? "New note" : "Updated note";
          const changedDate = formatDate(item.changedAt);
          const spoilerNotice = item.spoilerOmitted
            ? `<div style="margin:0 0 8px 0;padding:8px 10px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;font-size:13px;line-height:1.4;border-radius:6px;">Spoiler content omitted. Open note to read the full version.</div>`
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
<section class="card" style="border-top:1px solid #e5e7eb;padding-top:14px;margin-top:14px;">
  <div style="margin:0 0 6px 0;font-size:20px;line-height:1.3;color:#111827;font-weight:700;">${titleHtml}</div>
  ${folderBreadcrumb}
  <div class="meta" style="margin:0 0 8px 0;color:#6b7280;font-size:13px;line-height:1.3;"><span class="badge" style="display:inline-block;padding:2px 7px;border-radius:999px;background:#e8f0fe;color:#1e40af;font-weight:600;font-size:12px;">${statusLabel}</span>${changedDate ? ` <span class="meta-date" style="color:#6b7280;">&middot; ${changedDate}</span>` : ""}</div>
  ${spoilerNotice}
  ${renderExcerptBlocksHtml(item.excerptBlocks, permalink, { spoilerOmitted: item.spoilerOmitted, noteWordCount: item.noteWordCount, siteBaseUrl })}
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
