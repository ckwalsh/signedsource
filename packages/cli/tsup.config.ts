/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { tsup } from '@ckwalsh/typescript-dev-configs';

import pkg from './package.json' with { type: 'json' };

export default tsup.defineConfig(pkg, {
  format: ['cjs'],
  dts: false,
});
