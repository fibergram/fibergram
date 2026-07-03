import js from "@eslint/js"
import importX from "eslint-plugin-import-x"
import regexp from "eslint-plugin-regexp"
import unicorn from "eslint-plugin-unicorn"
import globals from "globals"
import tseslint from "typescript-eslint"

const ERROR = "error"
const WARN = "warn"
const OFF = "off"

export default tseslint.config(
  {
    // Global ignores (must be its own object to apply repo-wide).
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/docs/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/*.tsbuildinfo",
      // Generated Bot API surface — machine output, not hand-maintained
      "packages/core/src/client/generated/**",
      // Node scripts / test config not part of any package's TS project.
      "**/codegen/**",
      "**/vitest.config.ts",
      "vitest.shared.ts"
    ]
  },

  // --- Plain JS / config files (no type information) ---
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node
    },
    plugins: { unicorn, regexp },
    rules: {
      "no-console": [ERROR, { allow: ["warn", "error"] }],
      "prefer-const": ERROR,
      "no-var": ERROR,
      eqeqeq: [ERROR, "smart"],
      "unicorn/prefer-node-protocol": ERROR
    }
  },

  // --- Type-aware TypeScript (the fibergram packages) ---
  {
    files: ["packages/*/src/**/*.ts", "packages/*/test/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      regexp.configs["flat/recommended"],
      unicorn.configs["flat/recommended"]
    ],
    languageOptions: {
      parserOptions: {
        // tsconfig.test.json includes both src and test (tsconfig.json is the
        // composite build project and omits test), so one project per package
        // covers everything lintable — no central file list to keep in sync.
        project: ["packages/*/tsconfig.test.json"],
        tsconfigRootDir: import.meta.dirname
      },
      globals: globals.node
    },
    plugins: {
      "import-x": importX
    },
    settings: {
      "import-x/resolver": { typescript: true, node: true },
      "import-x/internal-regex": String.raw`^@fibergram(\/|$)`
    },
    linterOptions: {
      reportUnusedDisableDirectives: ERROR
    },
    rules: {
      // ── General correctness ──
      "no-console": [ERROR, { allow: ["warn", "error"] }],
      eqeqeq: [ERROR, "smart"],
      "@typescript-eslint/no-unused-vars": [
        ERROR,
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }
      ],
      "@typescript-eslint/consistent-type-imports": [
        ERROR,
        { prefer: "type-imports", fixStyle: "separate-type-imports" }
      ],
      "@typescript-eslint/ban-ts-comment": [
        ERROR,
        { "ts-expect-error": "allow-with-description", minimumDescriptionLength: 5 }
      ],

      // ── Effect idioms that tseslint's defaults fight ──
      // Effect leans on `namespace` for companion types / declaration merging (§14).
      "@typescript-eslint/no-namespace": OFF,
      // Type-level `{}` and empty interfaces are common in Effect brand/variance code.
      "@typescript-eslint/no-empty-object-type": OFF,
      // Effect combinators legitimately produce values used in void positions
      // (e.g. `yield*` results); this generic rule is too noisy for that.
      "@typescript-eslint/no-confusing-void-expression": OFF,
      "@typescript-eslint/no-non-null-assertion": OFF,
      // `ReadonlyArray<T>` is idiomatic Effect (it's even a core module); don't
      // force it to `readonly T[]`.
      "@typescript-eslint/array-type": OFF,
      // Effect's data-first combinators — Effect.map(self, f), Effect.flatMap(self, f)
      // — read like `Array#map(cb, thisArg)` to this non-type-aware rule. False on
      // every combinator call, so it must be off for an Effect codebase.
      "unicorn/no-array-method-this-argument": OFF,
      "unicorn/no-negated-condition": OFF,
      // Effect's tagged errors are class factories: `class E extends
      // Data.TaggedError("E")<{…}> {}`. This rule's autofix wrongly inserts `new`
      // before the factory call and corrupts the declaration — never enable it here.
      "unicorn/throw-new-error": OFF,

      // ── import ordering ──
      "import-x/first": ERROR,
      "import-x/no-self-import": ERROR,
      "import-x/no-duplicates": ERROR,
      "import-x/consistent-type-specifier-style": [ERROR, "prefer-top-level"],
      "import-x/order": [
        ERROR,
        {
          "newlines-between": "always",
          groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"], "type"],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ],

      // ── unicorn: keep the sharp rules, drop the ones that clash with Effect FP ──
      // Effect code names type params E/R/A and uses `_tag`, `fa`, `ma`, etc.
      "unicorn/prevent-abbreviations": OFF,
      // effect-smol modules are PascalCase (Effect.ts, Layer.ts) alongside index.ts.
      "unicorn/filename-case": [
        ERROR,
        { cases: { pascalCase: true, camelCase: true, kebabCase: true } }
      ],
      "unicorn/no-null": OFF,
      "unicorn/no-array-reduce": OFF,
      "unicorn/no-array-callback-reference": OFF,
      "unicorn/prefer-top-level-await": OFF,
      "unicorn/prefer-ternary": [ERROR, "only-single-line"],
      "unicorn/switch-case-braces": [ERROR, "avoid"],

      // ── Surfaced as warnings, not blockers ──────────────────────────────────
      // `any` and the type-aware unsafe-* family legitimately trip on Effect's
      // variance encoding, the generic Coroutine DSL, and third-party `any` at the
      // webhook edge (Express/Fastify req). Keep them visible without blocking CI —
      // this mirrors effect-smol's own pragmatism (see also [[effect-v4-beta-api]]).
      "@typescript-eslint/no-explicit-any": WARN,
      "@typescript-eslint/no-unsafe-assignment": WARN,
      "@typescript-eslint/no-unsafe-return": WARN,
      "@typescript-eslint/no-unsafe-argument": WARN,
      "@typescript-eslint/no-unsafe-call": WARN,
      "@typescript-eslint/no-unsafe-member-access": WARN,
      "@typescript-eslint/no-base-to-string": WARN,
      "@typescript-eslint/prefer-optional-chain": WARN,
      // Opinionated style over deliberate code (encoding charCodeAt, local closures,
      // match ternaries) — advisory, not enforced.
      "unicorn/prefer-code-point": WARN,
      "unicorn/consistent-function-scoping": WARN,
      "unicorn/no-nested-ternary": WARN,
      "unicorn/no-array-for-each": WARN,
      // Genuine ReDoS smell worth a human look, but not an auto-fixable blocker.
      "regexp/no-super-linear-backtracking": WARN
    }
  },

  // --- Tests: relax the strictest type-aware rules for terse specs ---
  {
    files: ["**/test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": OFF,
      "@typescript-eslint/no-non-null-assertion": OFF,
      "@typescript-eslint/no-unsafe-assignment": OFF,
      "@typescript-eslint/no-unsafe-member-access": OFF,
      "@typescript-eslint/no-unsafe-call": OFF,
      "@typescript-eslint/no-unsafe-argument": OFF,
      "no-console": OFF
    }
  }
)
