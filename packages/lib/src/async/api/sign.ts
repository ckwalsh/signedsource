/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedContentHashes, SignedSignatureToken } from '../../types.ts';
import type { SignedSourceAnalyzerDefaultOptions } from './analyze.ts';
import type { SignedContentValidatorIf } from './validate.ts';

export interface SignedContentSignerIf extends SignedContentValidatorIf {
  readonly PLACEHOLDER: string;

  sign(hashes: SignedContentHashes): Promise<SignedSignatureToken>;
}

export interface SignedSourceSignerOptions {
  sourceType: 'generated' | 'partially-generated' | undefined;
  signer: SignedContentSignerIf;
  manualSectionOverrides?: Record<string, string>;
}

export interface SignedSourceSignerDefaultOptions
  extends SignedSourceAnalyzerDefaultOptions {
  signer?: SignedSourceSignerOptions['signer'] | undefined;
}

export interface SignedSourceSignerIf<TSource = unknown, TResult = unknown> {
  sign(source: TSource, options?: Partial<SignedSourceSignerOptions>): TResult;

  unsign(
    source: TSource,
    options?: Partial<SignedSourceSignerOptions>,
  ): TResult;
}
