/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  SignedSourceAnalyzerDefaultOptions,
  SignedStreamAnalyzerIf,
  SignedStringAnalyzerIf,
} from '../../../src/index.ts';
import {
  SignedSourceAnalyzer,
  SignedStreamAnalyzer,
  SignedStringAnalyzer,
} from '../../../src/index.ts';

export type AnalyzerTestCaseKey =
  | 'SignedStringAnalyzer'
  | 'SignedStreamAnalyzer'
  | 'SignedSourceAnalyzer';

interface AnalyzerTestCaseBase {
  analyzerKey: AnalyzerTestCaseKey;
  AnalyzerCtor: new (
    options: SignedSourceAnalyzerDefaultOptions | undefined,
  ) => SignedStringAnalyzerIf | SignedStreamAnalyzerIf;
}

interface StringAnalyzerTestCase extends AnalyzerTestCaseBase {
  supportsStringInput: true;
  supportsStreamInput: false;
  AnalyzerCtor: new (
    options: SignedSourceAnalyzerDefaultOptions | undefined,
  ) => SignedStringAnalyzerIf;
}

interface StreamAnalyzerTestCase extends AnalyzerTestCaseBase {
  supportsStringInput: false;
  supportsStreamInput: true;
  AnalyzerCtor: new (
    options: SignedSourceAnalyzerDefaultOptions | undefined,
  ) => SignedStreamAnalyzerIf;
}

interface UnifiedAnalyzerTestCase extends AnalyzerTestCaseBase {
  supportsStringInput: true;
  supportsStreamInput: true;
  AnalyzerCtor: new (
    options: SignedSourceAnalyzerDefaultOptions | undefined,
  ) => SignedStringAnalyzerIf & SignedStreamAnalyzerIf;
}

type AnalyzerTestCase =
  | StringAnalyzerTestCase
  | StreamAnalyzerTestCase
  | UnifiedAnalyzerTestCase;

const TEST_CASE_MAP: Record<AnalyzerTestCaseKey, AnalyzerTestCase> = {
  SignedStringAnalyzer: {
    analyzerKey: 'SignedStringAnalyzer',
    AnalyzerCtor: SignedStringAnalyzer,
    supportsStringInput: true,
    supportsStreamInput: false,
  },
  SignedStreamAnalyzer: {
    analyzerKey: 'SignedStreamAnalyzer',
    AnalyzerCtor: SignedStreamAnalyzer,
    supportsStringInput: false,
    supportsStreamInput: true,
  },
  SignedSourceAnalyzer: {
    analyzerKey: 'SignedSourceAnalyzer',
    AnalyzerCtor: SignedSourceAnalyzer,
    supportsStringInput: true,
    supportsStreamInput: true,
  },
};

for (const [key, value] of Object.entries(TEST_CASE_MAP)) {
  if (value.analyzerKey !== key) {
    throw new Error(
      `Analyzer test case label mismatch: expected ${key}, got ${value.analyzerKey}`,
    );
  }
}

export const ANALYZER_TEST_CASES: AnalyzerTestCase[] = Object.entries(
  TEST_CASE_MAP,
).map((entry) => entry[1]);
