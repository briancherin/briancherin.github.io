const path = require("path");
const { execFileSync } = require("child_process");

const gitDateCache = new Map();
const TIMESTAMP_KEYS = new Set(["created", "updated"]);

function toRepoRelativePath(inputPath) {
  if (!inputPath || typeof inputPath !== "string") return "";
  const absolutePath = path.resolve(inputPath);
  return path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");
}

function readGitDateHistory(repoRelativePath) {
  try {
    const output = execFileSync(
      "git",
      ["log", "--follow", "--format=%H%x00%aI", "--", repoRelativePath],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }
    );
    return output
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [hash, date] = line.split("\0");
        return { hash, date };
      })
      .filter(({ hash, date }) => hash && date);
  } catch {
    return [];
  }
}

function readFileAtCommit(commit, repoRelativePath) {
  try {
    return execFileSync("git", ["show", `${commit}:${repoRelativePath}`], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

function getFirstParent(commit) {
  try {
    const output = execFileSync("git", ["rev-list", "--parents", "-n", "1", commit], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return output.split(/\s+/)[1] || null;
  } catch {
    return null;
  }
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = stableJson(value[key]);
      return acc;
    }, {});
}

function normalizeDigitalGardenTimestamps(content) {
  if (!content) return content;

  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return content;

  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex === -1) return content;

  const frontmatter = lines.slice(1, endIndex);
  if (frontmatter.length !== 1) return content;

  try {
    const data = JSON.parse(frontmatter[0]);
    for (const key of TIMESTAMP_KEYS) delete data[key];
    const normalizedFrontmatter = JSON.stringify(stableJson(data));
    return ["---", normalizedFrontmatter, "---", ...lines.slice(endIndex + 1)].join("\n");
  } catch {
    return content;
  }
}

function isSubstantiveCommit(commit, repoRelativePath) {
  const parent = getFirstParent(commit);
  const currentContent = readFileAtCommit(commit, repoRelativePath);
  if (!parent || currentContent === null) return true;

  const parentContent = readFileAtCommit(parent, repoRelativePath);
  if (parentContent === null) return true;

  return (
    normalizeDigitalGardenTimestamps(currentContent) !==
    normalizeDigitalGardenTimestamps(parentContent)
  );
}

function getGitNoteDates(inputPath) {
  const repoRelativePath = toRepoRelativePath(inputPath);
  if (!repoRelativePath) return null;

  const cached = gitDateCache.get(repoRelativePath);
  if (cached) return cached;

  const history = readGitDateHistory(repoRelativePath);
  if (history.length === 0) {
    gitDateCache.set(repoRelativePath, null);
    return null;
  }

  const latestSubstantiveCommit = history.find(({ hash }) =>
    isSubstantiveCommit(hash, repoRelativePath)
  );
  const firstCommit = history[history.length - 1];

  const dates = {
    // Ignore Digital Garden timestamp-only commits when deciding "updated".
    updated: latestSubstantiveCommit?.date || history[0].date,
    // First commit in this repo where this note appeared.
    created: firstCommit.date,
  };

  gitDateCache.set(repoRelativePath, dates);
  return dates;
}

module.exports = {
  getGitNoteDates,
};
