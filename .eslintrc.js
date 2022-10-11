const config = require("@blitzjs/next/eslint");
module.exports = {
  ...config,
  rules: {
    ...config.rules,

    // Hack until https://github.com/blitz-js/blitz/issues/3814 is fixed
    "react/no-unknown-property": [
      2,
      {
        ignore: ["global", "jsx"],
      },
    ],

    "sort-imports": ["error", { ignoreDeclarationSort: true }],
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc" },
      },
    ],
  },
  ignorePatterns: ["app/lib/labelGrammar.ts"],
};
