const path = require("path");
const { execFileSync } = require("child_process");

const gitDateCache = new Map();

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

function stripFrontmatter(content) {
  if (!content) return content;

  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return content;

  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex === -1) return content;

  return lines.slice(endIndex + 1).join("\n");
}

function isSubstantiveCommit(commit, repoRelativePath) {
  const parent = getFirstParent(commit);
  const currentContent = readFileAtCommit(commit, repoRelativePath);
  if (!parent || currentContent === null) return true;

  const parentContent = readFileAtCommit(parent, repoRelativePath);
  if (parentContent === null) return true;

  return (
    stripFrontmatter(currentContent) !==
    stripFrontmatter(parentContent)
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
    // Ignore frontmatter-only Digital Garden commits when deciding "updated".
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
