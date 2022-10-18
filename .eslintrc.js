module.exports = {
  extends: [require.resolve("@blitzjs/next/eslint")],
  rules: {
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
