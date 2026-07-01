import { defineConfig } from "vitest/config"

// Shared test config; each package merges it into its own vitest.config.ts.
// Dialog tests run on TestClock + Layer.mock without network (design §5.6).
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    globals: false,
    passWithNoTests: true
  }
})
