/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { runFixtureTests } from '../../utils/run.ts';

runFixtureTests(import.meta.url, {
  'generated.txt': {
    label: 'generated file with standard token',
    sourceType: 'generated',
    isWellFormed: true,
    signedBy: 'md5',
    isValidSignature: true,
  },
  'partial.txt': {
    label: 'partially-generated file with standard token',
    sourceType: 'partially-generated',
    isWellFormed: true,
    signedBy: 'md5',
    isValidSignature: true,
    manualSections: ['pets'],
  },
  'partial.early.txt': {
    label: 'partially-generated file with early manual section',
    sourceType: 'partially-generated',
    isWellFormed: true,
    signedBy: 'md5',
    isValidSignature: true,
    manualSections: ['pets'],
  },
});
