import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Тесты лежат рядом с тем, что тестируют. `tsconfigPaths` делает так, чтобы `@/`
 * значил здесь то же, что и в приложении.
 *
 * Репозиторий не должен лежать в пути с пробелом: Vite строит путь как URL, и %20
 * ломает обход до node_modules.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
