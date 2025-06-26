/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedSourceAnalysis } from '../../types.ts';

export interface SignedSourceAnalyzerOptions {
  sourceType: 'generated' | 'partially-generated' | undefined;
}

export interface SignedSourceAnalyzerDefaultOptions {
  sourceType?: SignedSourceAnalyzerOptions['sourceType'] | undefined;
}

export interface SignedSourceAnalyzerIf<TSource = unknown> {
  isGenerated(
    source: TSource,
    options?: Partial<SignedSourceAnalyzerOptions>,
  ): Promise<boolean>;

  isSigned(
    source: TSource,
    options?: Partial<SignedSourceAnalyzerOptions>,
  ): Promise<boolean>;

  analyze(
    source: TSource,
    options?: Partial<SignedSourceAnalyzerOptions>,
  ): Promise<SignedSourceAnalysis>;
}
