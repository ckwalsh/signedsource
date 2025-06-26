/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { runFixtureTests } from '../utils/run.ts';

runFixtureTests(import.meta.url, {
  'foobar.txt': {
    label: 'manual file',
    sourceType: 'manual',
    isWellFormed: true,
  },
});
