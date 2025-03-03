// vite.config.js or vitest.config.js
export default {
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/vitest-setup.js"],
    coverage: {
      reporter: ["html", "text", "json"],
      include: ["src/components/**/*.jsx"], // <-- Include only component files
      exclude: [
        // <-- Exclude patterns
        "**/node_modules/**",
        "**/test/**",
        "**/tests/**",
        "**/coverage/**",
        "**/dist/**",
        "**/build/**",
        "**/vite.config.*",
        "**/vitest.config.*",
        "**/tailwind.config.*",
        "**/postcss.config.*",
        "**/setupTests.*",
        "**/setupFiles.*",
        "**/.storybook/**",
        "**/.git/**",
        // Add any other files or directories you want to exclude
      ],
    },
  },
};
