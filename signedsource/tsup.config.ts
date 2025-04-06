/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib/index.ts', 'lib/full/index.ts', 'lib/partial/index.ts'],
  outDir: 'dist',
  minify: 'terser',
  clean: true,
  dts: true,
  sourcemap: true,
  format: ['cjs', 'esm'],
});
