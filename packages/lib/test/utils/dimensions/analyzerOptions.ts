/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedSourceAnalyzerDefaultOptions } from '../../../src/index.ts';

export type AnalyzerDefaultOptionsTestCaseKey =
  | 'default'
  | 'generated only'
  | 'partially-generated only';

interface AnalyzerDefaultOptionsTestCase {
  analyzerOptionsKey: AnalyzerDefaultOptionsTestCaseKey;
  analyzerOptions: SignedSourceAnalyzerDefaultOptions | undefined;
}

const TEST_CASE_MAP: Record<
  AnalyzerDefaultOptionsTestCaseKey,
  AnalyzerDefaultOptionsTestCase
> = {
  'default': { analyzerOptionsKey: 'default', analyzerOptions: undefined },
  'generated only': {
    analyzerOptionsKey: 'generated only',
    analyzerOptions: {
      sourceType: 'generated',
    },
  },
  'partially-generated only': {
    analyzerOptionsKey: 'partially-generated only',
    analyzerOptions: {
      sourceType: 'partially-generated',
    },
  },
};

for (const [key, value] of Object.entries(TEST_CASE_MAP)) {
  if (value.analyzerOptionsKey !== key) {
    throw new Error(
      `Analyzer Options test case label mismatch: expected ${key}, got ${value.analyzerOptionsKey}`,
    );
  }
}

export const ANALYZER_OPTIONS_TEST_CASES: AnalyzerDefaultOptionsTestCase[] =
  Object.entries(TEST_CASE_MAP).map((entry) => entry[1]);
