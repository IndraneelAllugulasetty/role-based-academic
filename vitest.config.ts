import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup-env.mjs'],
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
  },
});
