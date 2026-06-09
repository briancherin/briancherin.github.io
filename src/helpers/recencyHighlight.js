const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const matter = require("gray-matter");
const slugify = require("@sindresorhus/slugify");

const NOTES_ROOT = path.join(process.cwd(), "src", "site", "notes");
const WORD_REGEX = /[A-Za-z0-9][A-Za-z0-9'-]*/g;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const permalinkToSource = new Map();
const sourceToTimestamps = new Map();

function normalizePermalink(urlPath) {
  if (!urlPath) return "/";
  const noQuery = urlPath.split("?")[0].split("#")[0];
  if (noQuery === "/") return "/";
  return noQuery.endsWith("/") ? noQuery : `${noQuery}/`;
}

function walkMarkdownFiles(rootDir) {
  const output = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) output.push(full);
    }
  }
  return output;
}

function resolvePermalinkForNote(absolutePath) {
  const raw = fs.readFileSync(absolutePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data || {};
  if (Array.isArray(data.tags) && data.tags.includes("gardenEntry")) return "/";
  if (typeof data.permalink === "string" && data.permalink.trim().length > 0) {
    return normalizePermalink(data.permalink.trim());
  }
  const fileSlug = path.basename(absolutePath, ".md");
  return normalizePermalink(`/notes/${slugify(fileSlug)}/`);
}

function buildPermalinkIndex() {
  if (permalinkToSource.size > 0) return;
  const files = walkMarkdownFiles(NOTES_ROOT);
  for (const file of files) {
    const permalink = resolvePermalinkForNote(file);
    permalinkToSource.set(permalink, file);
  }
}

function stripFrontmatter(lines) {
  if (!lines[0] || lines[0].trim() !== "---") return lines;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") return lines.slice(i + 1);
  }
  return lines;
}

function markdownLineToWords(line) {
  if (!line) return [];
  let text = line;

  // Ignore standalone footnote definition lines (e.g. [^1]: ...)
  if (/^\[\^[^\]]+\]:/.test(text.trim())) {
    return [];
  }

  text = text.replace(/`[^`]*`/g, " ");
  text = text.replace(/\[![^\]]+\]/g, " ");
  text = text.replace(/\!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?]]/g, (_m, target, alias) => {
    if (alias && alias.trim().length > 0) return alias;
    const normalized = String(target || "").replace(/\\/g, "/");
    const parts = normalized.split("/");
    return parts[parts.length - 1] || normalized;
  });

  // Strip footnote references so they don't shift visible-word mapping
  text = text.replace(/\[\^[^\]]+\]/g, " ");
  text = text.replace(/\^\[[^\]]*\]/g, " ");

  text = text.replace(/https?:\/\/\S+/g, " ");
  text = text.replace(/[#>*_~|]/g, " ");
  const words = text.match(WORD_REGEX);
  return words || [];
}

function getWordTimestampsForSource(sourceFile) {
  if (sourceToTimestamps.has(sourceFile)) return sourceToTimestamps.get(sourceFile);

  const relPath = path.relative(process.cwd(), sourceFile).replace(/\\/g, "/");
  const blameRaw = execSync(`git blame --line-porcelain -- "${relPath}"`, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  const lines = blameRaw.split(/\r?\n/);
  const blameLineEntries = [];
  let currentTimestamp = null;
  for (const line of lines) {
    if (line.startsWith("author-time ")) {
      currentTimestamp = Number(line.slice("author-time ".length).trim()) * 1000;
      continue;
    }
    if (line.startsWith("\t")) blameLineEntries.push({ line: line.slice(1), timestamp: currentTimestamp });
  }

  const contentOnlyLines = stripFrontmatter(blameLineEntries.map((x) => x.line));
  const startIdx = blameLineEntries.length - contentOnlyLines.length;
  const filteredEntries = blameLineEntries.slice(startIdx);
  const nowMs = Date.now();
  const timestamps = [];

  for (const entry of filteredEntries) {
    const words = markdownLineToWords(entry.line);
    if (words.length === 0) continue;
    const timestamp = entry.timestamp || nowMs - (3650 * MS_PER_DAY);
    for (let i = 0; i < words.length; i += 1) timestamps.push(timestamp);
  }

  sourceToTimestamps.set(sourceFile, timestamps);
  return timestamps;
}

function outputPathToPermalink(outputPath) {
  const normalized = outputPath.replace(/\\/g, "/");
  let distRelativePath = null;
  if (normalized.startsWith("dist/")) distRelativePath = normalized.slice("dist/".length);
  else {
    const marker = "/dist/";
    const markerIdx = normalized.indexOf(marker);
    if (markerIdx !== -1) distRelativePath = normalized.slice(markerIdx + marker.length);
  }
  if (!distRelativePath) return null;
  return normalizePermalink(`/${distRelativePath.replace(/index\.html$/, "")}`);
}

function injectRecencyWordAges(html, outputPath) {
  if (!outputPath || !outputPath.endsWith(".html")) return html;
  buildPermalinkIndex();

  const permalink = outputPathToPermalink(outputPath);
  if (!permalink) return html;
  const sourceFile = permalinkToSource.get(permalink);
  if (!sourceFile) return html;

  let timestamps;
  try {
    timestamps = getWordTimestampsForSource(sourceFile);
  } catch {
    return html;
  }
  if (!timestamps || timestamps.length === 0) return html;

  const payload = JSON.stringify(timestamps);
  const scriptTag = `<script>window.__recencyWordTimestamps=${payload};</script>`;
  if (html.includes("</body>")) return html.replace("</body>", `${scriptTag}</body>`);
  return `${html}${scriptTag}`;
}

module.exports = {
  injectRecencyWordAges,
};
