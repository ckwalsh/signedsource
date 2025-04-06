/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'tsup';

const config = defineConfig({
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  format: ['cjs', 'esm'],
});

export default config;
