const slugify = require("@sindresorhus/slugify");

// Put your computations here.

function getNoteFolderPathParts(data) {
  if (!data || !data.page || !data.page.filePathStem) {
    return [];
  }

  if (data.tags && data.tags.indexOf("gardenEntry") !== -1) {
    return [];
  }

  let pathParts = [];
  if (data["dg-path"]) {
    pathParts = data["dg-path"].split("/");
  } else {
    const stem = data.page.filePathStem;
    const stemParts = stem.split("notes/");
    if (stemParts.length < 2) {
      return [];
    }
    pathParts = stemParts[1].split("/");
  }

  if (pathParts.length <= 1) {
    return [];
  }

  pathParts.pop();
  return pathParts.filter(Boolean);
}

function userComputed(data) {
  const noteFolderPathParts = getNoteFolderPathParts(data);
  const noteFolderBreadcrumbs = noteFolderPathParts.map((name, index) => {
    const slugPath = noteFolderPathParts
      .slice(0, index + 1)
      .map((part) => slugify(part))
      .join("/");

    return {
      name,
      url: `/${slugPath}/`,
    };
  });

  return {
    noteFolderPathParts,
    noteFolderPath: noteFolderPathParts.join(" > "),
    noteFolderBreadcrumbs,
  };
}

exports.userComputed = userComputed;
