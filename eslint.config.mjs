import js from "@eslint/js";
import tseslint from "typescript-eslint";

const nodeGlobals = {
  process: "readonly",
  console: "readonly",
  Buffer: "readonly",
  URL: "readonly",
  __dirname: "readonly",
  globalThis: "readonly",
  module: "readonly",
  require: "readonly",
};

const ignores = [
  "**/node_modules/**",
  "**/.next/**",
  "**/out/**",
  "**/dist/**",
  "**/coverage/**",
  "**/playwright-report/**",
  "**/test-results/**",
  "**/.data/**",
  "**/.pnpm-store/**",
  "**/.pnpm-cache/**",
  "**/.pnpm-state/**",
  "**/next-env.d.ts",
  "**/drizzle/**",
];

/** Запрет импортов с объяснением — границы слоёв из ADR-0001. */
function forbid(group, message) {
  return {
    "no-restricted-imports": ["error", { patterns: [{ group, message }] }],
  };
}

export default tseslint.config(
  { ignores },
  {
    files: ["eslint.config.mjs", "scripts/**/*.mjs"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      eqeqeq: ["error", "smart"],
    },
  },
  // shared — нижний слой: только zod и stdlib, без доменов и UI.
  {
    files: ["packages/shared/**/*.{ts,tsx}"],
    rules: forbid(
      ["react", "react-dom", "react/*", "next", "next/*", "@opora/db", "@opora/core", "@opora/llm", "@opora/ui"],
      "packages/shared — нижний слой, не должен зависеть от других пакетов.",
    ),
  },
  // core — домены без Next/React и без UI.
  {
    files: ["packages/core/**/*.{ts,tsx}"],
    rules: forbid(
      ["react", "react-dom", "react/*", "next", "next/*", "@opora/ui", "@opora/web", "@opora/worker"],
      "packages/core не должен знать про Next/React/UI (ADR-0001).",
    ),
  },
  // db — только схема, миграции и репозитории.
  {
    files: ["packages/db/**/*.{ts,tsx}"],
    rules: forbid(
      ["react", "react-dom", "react/*", "next", "next/*", "@opora/core", "@opora/llm", "@opora/ui", "@opora/web", "@opora/worker"],
      "packages/db не должен зависеть от доменов, UI и Next.",
    ),
  },
  // llm — транспортный слой, не знает доменов.
  {
    files: ["packages/llm/**/*.{ts,tsx}"],
    rules: forbid(
      ["react", "react-dom", "react/*", "next", "next/*", "@opora/core", "@opora/db", "@opora/ui", "@opora/web"],
      "packages/llm не должен знать про домены (ADR-0001).",
    ),
  },
  // ui — только React и стили.
  {
    files: ["packages/ui/**/*.{ts,tsx}"],
    rules: forbid(
      ["next", "next/*", "@opora/core", "@opora/db", "@opora/llm", "@opora/web"],
      "packages/ui не должен знать про домены и Next.",
    ),
  },
  // web: БД — только через core, без прямых драйверов.
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: forbid(
      ["drizzle-orm", "drizzle-orm/*", "pg", "@electric-sql/pglite", "bullmq", "@opora/worker"],
      "apps/web не обращается к БД/очередям напрямую — только через @opora/core (ADR-0001).",
    ),
  },
  // worker: без UI и Next.
  {
    files: ["apps/worker/**/*.{ts,tsx}"],
    rules: forbid(
      ["react", "react-dom", "react/*", "next", "next/*", "@opora/ui", "@opora/web"],
      "apps/worker не должен зависеть от UI и Next.",
    ),
  },
);
