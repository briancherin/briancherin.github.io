require("dotenv").config();
const settings = require("../../helpers/constants");
const { getGitNoteDates } = require("../../helpers/gitNoteDates");

const allSettings = settings.ALL_NOTE_SETTINGS;

module.exports = {
  eleventyComputed: {
    layout: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "layouts/index.njk";
      }
      return "layouts/note.njk";
    },
    permalink: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "/";
      }
      return data.permalink || undefined;
    },
    created: (data) => {
      const gitDates = getGitNoteDates(data?.page?.inputPath);
      return gitDates?.created || data.created;
    },
    updated: (data) => {
      const gitDates = getGitNoteDates(data?.page?.inputPath);
      return gitDates?.updated || data.updated;
    },
    settings: (data) => {
      const noteSettings = {};
      allSettings.forEach((setting) => {
        let noteSetting = data[setting];
        let globalSetting = process.env[setting];

        let settingValue =
          noteSetting || (globalSetting === "true" && noteSetting !== false);
        noteSettings[setting] = settingValue;
      });
      return noteSettings;
    },
  },
};
