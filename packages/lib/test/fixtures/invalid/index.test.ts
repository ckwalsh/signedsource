/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { runFixtureTests } from '../utils/run.ts';

runFixtureTests(import.meta.url, {
  'generated.no_token.txt': {
    label: 'generated document without token',
    sourceType: 'generated',
    isWellFormed: false,
  },
  'generated.short_signature.txt': {
    label: 'short signature in generated document',
    sourceType: 'generated',
    isWellFormed: true,
    signedBy: 'md5',
    isValidSignature: false,
  },
  'generated.invalid_signature.txt': {
    label: 'invalid signature in generated document',
    sourceType: 'generated',
    isWellFormed: true,
    signedBy: 'ed25519',
    isValidSignature: false,
  },
  'partial.no_token.txt': {
    label: 'partially generated document without token',
    sourceType: 'partially-generated',
    isWellFormed: false,
    manualSections: [],
  },
  'partial.open_section.txt': {
    label: 'partially generated document with open section',
    sourceType: 'partially-generated',
    isWellFormed: false,
    manualSections: [],
  },
});
