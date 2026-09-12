"use strict";

const rule = require("./lib/rules/detect-redos");

module.exports = {
  meta: { name: "eslint-plugin-redos-detector", version: "2.0.0" },
  rules: { "detect-redos": rule },
  configs: {
    recommended: {
      plugins: ["redos-detector"],
      rules: { "redos-detector/detect-redos": "error" },
    },
  },
};
