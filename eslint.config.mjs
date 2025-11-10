import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";
import securityPlugin from "eslint-plugin-security";
import prettier from "eslint-plugin-prettier";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";

const webFiles = ["apps/web/**/*.{js,jsx,ts,tsx}"];
const apiFiles = ["apps/api/**/*.{js,ts}"];
const webProjects = ["./tsconfig.base.json", "./apps/web/tsconfig.json"];
const apiProjects = ["./apps/api/tsconfig.json"];

const sharedPlugins = {
  "@typescript-eslint": tseslint.plugin,
  import: pluginImport,
  security: securityPlugin,
  prettier,
  unicorn,
  sonarjs,
};

const sharedRules = {
  "no-unused-vars": "off",
  "prettier/prettier": "warn",
  "unicorn/filename-case": [
    "error",
    {
      case: "kebabCase",
      ignore: ["^.*\\.config\\.(js|ts|mjs)$", "^.*\\.d\\.ts$"],
    },
  ],
  "spaced-comment": ["error", "always", { exceptions: ["-", "+"] }],
  "key-spacing": ["error", { beforeColon: false, afterColon: true }],
  "no-useless-rename": "error",
  "import/no-mutable-exports": "error",
  "import/order": [
    "error",
    {
      groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
      pathGroups: [
        {
          pattern: "react",
          group: "external",
          position: "before",
        },
        {
          pattern: "{next,next/**}",
          group: "external",
          position: "before",
        },
      ],
      pathGroupsExcludedImportTypes: [],
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
      },
    },
  ],
  "import/newline-after-import": "error",
  "import/no-unresolved": [
    "error",
    {
      caseSensitive: true,
    },
  ],
  "no-duplicate-imports": ["error", { includeExports: true }],
  "import/no-cycle": ["error", { maxDepth: 2 }],
  "no-trailing-spaces": "error",
  "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
  "space-before-function-paren": [
    "error",
    {
      anonymous: "always",
      named: "never",
      asyncArrow: "always",
    },
  ],
  "space-in-parens": ["error", "never"],
  "array-bracket-spacing": ["error", "never"],
  "object-curly-spacing": ["error", "always"],
  "func-call-spacing": ["error", "never"],
  "computed-property-spacing": ["error", "never"],
  "no-underscore-dangle": ["error", { allow: ["_id", "__dirname"] }],
  complexity: ["error", { max: 10 }],
  "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
  "max-depth": ["error", 4],
  "@typescript-eslint/prefer-nullish-coalescing": "error",
  "@typescript-eslint/no-unnecessary-type-assertion": "error",
  "@typescript-eslint/no-unnecessary-condition": "warn",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": ["warn"],
  "sonarjs/no-commented-code": "warn",
};

const reactRules = {
  "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
  "react/jsx-pascal-case": [
    "error",
    {
      allowAllCaps: false,
      ignore: [],
    },
  ],
  "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
  "react/jsx-no-constructed-context-values": "error",
  "react/no-array-index-key": "warn",
};

const scopeConfigs = (configs, files, project) =>
  configs.map((config) => ({
    ...config,
    files,
    languageOptions: {
      ...(config.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        ...(config.languageOptions?.parserOptions ?? {}),
        project,
      },
    },
  }));

export default defineConfig([
  ...scopeConfigs(nextVitals, webFiles, webProjects),
  ...scopeConfigs(nextTs, webFiles, webProjects),
  ...scopeConfigs(tseslint.configs.recommended, webFiles, webProjects),
  {
    ...pluginJs.configs.recommended,
    files: webFiles,
  },
  {
    ...securityPlugin.configs.recommended,
    files: webFiles,
  },
  {
    files: webFiles,
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: webProjects,
      },
    },
    plugins: {
      ...sharedPlugins,
    },
    rules: {
      ...sharedRules,
      ...reactRules,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: webProjects,
        },
      },
    },
  },
  ...scopeConfigs(tseslint.configs.recommended, apiFiles, apiProjects),
  {
    ...pluginJs.configs.recommended,
    files: apiFiles,
  },
  {
    ...securityPlugin.configs.recommended,
    files: apiFiles,
  },
  {
    files: apiFiles,
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: apiProjects,
      },
    },
    plugins: {
      ...sharedPlugins,
    },
    rules: {
      ...sharedRules,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: apiProjects,
        },
      },
    },
  },
  {
    files: ["apps/web/next-env.d.ts"],
    rules: {
      "spaced-comment": "off",
    },
  },
  globalIgnores([
    ".github/",
    ".husky/",
    "node_modules/",
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "apps/**/src/components/ui",
    "*.config.ts",
    "*.mjs",
    "apps/**/.next/**",
  ]),
]);
