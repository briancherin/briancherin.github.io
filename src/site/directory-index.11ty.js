const slugify = require("@sindresorhus/slugify");
const settings = require("../helpers/constants");

const allSettings = settings.ALL_NOTE_SETTINGS;

function getNoteTitle(note) {
  if (note.data && note.data.title) {
    return note.data.title;
  }
  if (note.filePathStem) {
    const parts = note.filePathStem.split("/");
    return parts[parts.length - 1] || note.fileSlug;
  }
  return note.fileSlug;
}

function sortNotesByTitle(a, b) {
  return getNoteTitle(a).toLowerCase().localeCompare(getNoteTitle(b).toLowerCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getRelativeParts(note, parentParts) {
  const splitPath = note.filePathStem.split("/notes/");
  if (splitPath.length < 2) return [];

  const relativePath = splitPath[1];
  const pathParts = relativePath.split("/").filter(Boolean);
  if (pathParts.length < parentParts.length + 1) return [];

  return pathParts.slice(parentParts.length);
}

function buildHierarchyForDirectory(notes, parentParts, parentSlugPath) {
  const root = { isFolder: true };

  for (const note of notes) {
    const relativeParts = getRelativeParts(note, parentParts);
    if (!relativeParts.length) continue;

    const folderParts = relativeParts.slice(0, -1);
    const noteName = getNoteTitle(note);

    let cursor = root;
    let folderSlugPath = parentSlugPath;
    for (const folderName of folderParts) {
      if (!cursor[folderName]) {
        folderSlugPath = `${folderSlugPath}/${slugify(folderName)}`;
        cursor[folderName] = {
          isFolder: true,
          indexUrl: `/${folderSlugPath}/`,
        };
      } else {
        folderSlugPath = `${folderSlugPath}/${slugify(folderName)}`;
      }
      cursor = cursor[folderName];
    }

    const leafKey = `note-${slugify(relativeParts.join("/"))}-${slugify(
      note.url || note.filePathStem || noteName
    )}`;
    cursor[leafKey] = {
      isNote: true,
      name: noteName,
      permalink: note.url,
      hide: Boolean(note.data && note.data.hide),
    };
  }

  return root;
}

function sortHierarchyNode(node) {
  const folderEntries = [];
  const noteEntries = [];

  for (const [key, value] of Object.entries(node)) {
    if (key === "isFolder") continue;
    if (!value || typeof value !== "object") continue;
    if (value.isFolder) {
      folderEntries.push([key, value]);
    } else if (value.isNote && !value.hide) {
      noteEntries.push([key, value]);
    }
  }

  folderEntries.sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));
  noteEntries.sort(([, a], [, b]) => (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase()));

  const sorted = { isFolder: true };
  if (node.indexUrl) {
    sorted.indexUrl = node.indexUrl;
  }
  for (const [key, value] of folderEntries) {
    sorted[key] = sortHierarchyNode(value);
  }
  for (const [key, value] of noteEntries) {
    sorted[key] = value;
  }

  return sorted;
}

function countNotes(node) {
  if (!node || typeof node !== "object") return 0;
  if (node.isNote) return node.hide ? 0 : 1;

  return Object.entries(node)
    .filter(([key]) => key !== "isFolder")
    .reduce((sum, [, child]) => sum + countNotes(child), 0);
}

function buildDirectoryPages(notes) {
  const directoryMap = new Map();

  for (const note of notes) {
    if (note.data && Array.isArray(note.data.tags) && note.data.tags.includes("gardenEntry")) {
      continue;
    }

    const splitPath = note.filePathStem.split("/notes/");
    if (splitPath.length < 2) {
      continue;
    }

    const relativePath = splitPath[1];
    const pathParts = relativePath.split("/").filter(Boolean);
    if (pathParts.length < 2) {
      continue;
    }

    const directoryParts = pathParts.slice(0, -1);
    for (let depth = 1; depth <= directoryParts.length; depth += 1) {
      const originalParts = directoryParts.slice(0, depth);
      const slugParts = originalParts.map((part) => slugify(part));
      const directoryKey = slugParts.join("/");

      if (!directoryMap.has(directoryKey)) {
        directoryMap.set(directoryKey, {
          slugPath: directoryKey,
          originalParts,
          displayName: originalParts[originalParts.length - 1],
          notes: [],
        });
      }

      directoryMap.get(directoryKey).notes.push(note);
    }
  }

  const pages = Array.from(directoryMap.values()).map((directory) => {
    const notesInDirectory = [...directory.notes].sort(sortNotesByTitle);
    const hierarchy = sortHierarchyNode(
      buildHierarchyForDirectory(notesInDirectory, directory.originalParts, directory.slugPath)
    );
    return {
      ...directory,
      noteCount: notesInDirectory.length,
      notes: notesInDirectory,
      hierarchy,
    };
  });

  pages.sort((a, b) => a.slugPath.localeCompare(b.slugPath));
  return pages;
}

function getSettingsForPage() {
  const noteSettings = {};

  allSettings.forEach((setting) => {
    const globalSetting = process.env[setting];
    noteSettings[setting] = globalSetting === "true";
  });

  noteSettings.dgShowLocalGraph = false;
  noteSettings.dgShowToc = false;
  noteSettings.dgShowBacklinks = false;
  noteSettings.dgShowTags = false;
  noteSettings.dgShowInlineTitle = false;

  return noteSettings;
}

class DirectoryIndexPage {
  data() {
    return {
      pagination: {
        data: "collections.note",
        size: 1,
        alias: "directory",
        before: (notes) => buildDirectoryPages(notes),
      },
      eleventyExcludeFromCollections: true,
      layout: "layouts/note.njk",
      permalink: (data) => `/${data.directory.slugPath}/`,
      tags: ["directoryIndex"],
      settings: getSettingsForPage(),
      contentClasses: "directory-index-page",
      eleventyComputed: {
        title: (data) => data.directory.displayName,
        noteTitle: (data) => data.directory.displayName,
      },
    };
  }

  render(data) {
    const { directory } = data;
    const breadcrumb = directory.originalParts
      .map((part, index) => {
        const isCurrent = index === directory.originalParts.length - 1;
        if (isCurrent) {
          return `<span class="directory-breadcrumb-current">${escapeHtml(part)}</span>`;
        }
        const slugPath = directory.originalParts
          .slice(0, index + 1)
          .map((segment) => slugify(segment))
          .join("/");
        return `<a class="directory-breadcrumb-link" href="/${slugPath}/">${escapeHtml(part)}</a>`;
      })
      .join(" &gt; ");
    const hierarchyJson = JSON.stringify(directory.hierarchy);

    return `
      <section class="homepage-category-browser" aria-labelledby="browse-categories-heading">
        <div class="homepage-category-browser-header">
          <h2 id="browse-categories-heading">${breadcrumb}</h2>
          <div class="homepage-category-browser-actions">
            <button type="button" id="expand-all-categories">Expand all</button>
            <button type="button" id="collapse-all-categories">Collapse all</button>
          </div>
        </div>
        <p>${directory.noteCount} note${directory.noteCount === 1 ? "" : "s"} in this section.</p>
        <div id="homepage-category-tree"></div>
      </section>

      <script>
      (function () {
        const root = document.getElementById("homepage-category-tree");
        if (!root) return;

        const rawTree = ${hierarchyJson};
        const openFolderPaths = new Set(new URLSearchParams(window.location.search).getAll("open"));

        const countNotes = (node) => {
          if (!node || typeof node !== "object") return 0;
          if (node.isNote) return node.hide ? 0 : 1;

          return Object.entries(node)
            .filter(([key]) => key !== "isFolder")
            .reduce((sum, [, child]) => sum + countNotes(child), 0);
        };

        const getNodeChildren = (node) =>
          Object.entries(node).filter(([key]) => key !== "isFolder");

        const normalizePathSet = () => {
          const normalized = new Set();
          openFolderPaths.forEach((path) => {
            if (!path) return;
            const segments = path.split("/").filter(Boolean);
            for (let i = 1; i <= segments.length; i += 1) {
              normalized.add(segments.slice(0, i).join("/"));
            }
          });
          openFolderPaths.clear();
          normalized.forEach((path) => openFolderPaths.add(path));
        };

        const writeOpenStateToUrl = () => {
          const params = new URLSearchParams(window.location.search);
          params.delete("open");

          Array.from(openFolderPaths)
            .sort()
            .forEach((path) => params.append("open", path));

          const next = params.toString();
          const target = next
            ? window.location.pathname + "?" + next + window.location.hash
            : window.location.pathname + window.location.hash;
          window.history.replaceState(null, "", target);
        };

        const renderTree = () => {
          normalizePathSet();
          root.innerHTML = "";
          const fragment = document.createDocumentFragment();

          const renderNodes = (treeNode, container, pathPrefix) => {
            const children = getNodeChildren(treeNode);
            children.forEach(([name, child]) => {
              if (!child || typeof child !== "object") return;

              if (child.isFolder) {
                const folderPath = pathPrefix ? pathPrefix + "/" + name : name;
                const isOpen = openFolderPaths.has(folderPath);
                const noteCount = countNotes(child);

                if (noteCount === 0) return;

                const folderWrap = document.createElement("div");
                folderWrap.className = "hcb-node hcb-folder-node";
                folderWrap.dataset.path = folderPath;

                const folderButton = document.createElement("div");
                folderButton.className = "hcb-folder-button";
                folderButton.setAttribute("role", "button");
                folderButton.setAttribute("tabindex", "0");
                folderButton.setAttribute("aria-expanded", isOpen ? "true" : "false");

                const caret = document.createElement("span");
                caret.className = "hcb-caret";
                caret.textContent = isOpen ? "v" : ">";

                const title = document.createElement("span");
                title.className = "hcb-folder-title";

                const titleLink = document.createElement("a");
                titleLink.className = "hcb-folder-title-link";
                titleLink.href = child.indexUrl || "#";
                titleLink.title = "Open folder page";
                titleLink.setAttribute("aria-label", "Open folder page");
                titleLink.textContent = name;
                title.appendChild(titleLink);

                const count = document.createElement("span");
                count.className = "hcb-folder-count";
                count.textContent = "(" + noteCount + ")";

                folderButton.append(caret, title, count);

                const childWrap = document.createElement("div");
                childWrap.className = "hcb-children";
                if (!isOpen) {
                  childWrap.classList.add("hcb-children-hidden");
                }

                renderNodes(child, childWrap, folderPath);
                folderWrap.append(folderButton, childWrap);
                container.appendChild(folderWrap);
                return;
              }

              if (!child.isNote || child.hide) return;

              const leaf = document.createElement("a");
              leaf.className = "hcb-node hcb-leaf-chip";
              leaf.href = child.permalink || "/";
              leaf.textContent = child.name || name.replace(/\.md$/i, "");
              leaf.setAttribute("data-leaf", "true");
              container.appendChild(leaf);
            });
          };

          renderNodes(rawTree, fragment, "");
          root.appendChild(fragment);
        };

        root.addEventListener("click", (event) => {
          if (event.target.closest(".hcb-folder-title-link")) {
            event.stopPropagation();
            return;
          }

          const button = event.target.closest(".hcb-folder-button");
          if (!button) return;
          event.preventDefault();

          const folderNode = button.closest(".hcb-folder-node");
          if (!folderNode) return;

          const path = folderNode.dataset.path;
          const children = Array.from(folderNode.children).find((child) =>
            child.classList && child.classList.contains("hcb-children")
          );
          if (!path || !children) return;

          const isOpen = openFolderPaths.has(path);
          if (isOpen) {
            openFolderPaths.delete(path);
            children.classList.add("hcb-children-hidden");
            button.setAttribute("aria-expanded", "false");
            const caret = button.querySelector(".hcb-caret");
            if (caret) caret.textContent = ">";
          } else {
            openFolderPaths.add(path);
            children.classList.remove("hcb-children-hidden");
            button.setAttribute("aria-expanded", "true");
            const caret = button.querySelector(".hcb-caret");
            if (caret) caret.textContent = "v";
          }

          writeOpenStateToUrl();
        });

        root.addEventListener("keydown", (event) => {
          const button = event.target.closest(".hcb-folder-button");
          if (!button) return;
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          button.click();
        });

        document.getElementById("expand-all-categories")?.addEventListener("click", () => {
          const addAllFolderPaths = (node, parentPath) => {
            getNodeChildren(node).forEach(([name, child]) => {
              if (!child || !child.isFolder) return;
              const path = parentPath ? parentPath + "/" + name : name;
              if (countNotes(child) > 0) {
                openFolderPaths.add(path);
                addAllFolderPaths(child, path);
              }
            });
          };
          addAllFolderPaths(rawTree, "");
          writeOpenStateToUrl();
          renderTree();
        });

        document.getElementById("collapse-all-categories")?.addEventListener("click", () => {
          openFolderPaths.clear();
          writeOpenStateToUrl();
          renderTree();
        });

        renderTree();
      })();
      </script>
    `;
  }
}

module.exports = DirectoryIndexPage;
