/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignatureToken, SignedContentHashes } from '../../types.ts';
import type { SignedSourceAnalyzerDefaultOptions } from './analyze.ts';

export interface SignedContentValidatorIf {
  isValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<boolean>;

  assertIsValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<void>;
}

export interface SignedSourceValidatorOptions {
  sourceType: 'generated' | 'partially-generated' | undefined;
  validator: SignedContentValidatorIf;
  signature: SignatureToken;
}

export interface SignedSourceValidatorDefaultOptions
  extends SignedSourceAnalyzerDefaultOptions {
  validator?: SignedSourceValidatorOptions['validator'] | undefined;
}

export interface SignedSourceValidatorIf<TSource = unknown> {
  isValid(
    source: TSource,
    options?: Partial<SignedSourceValidatorOptions>,
  ): Promise<boolean>;

  assertIsValid(
    source: TSource,
    options?: Partial<SignedSourceValidatorOptions>,
  ): Promise<void>;
}
