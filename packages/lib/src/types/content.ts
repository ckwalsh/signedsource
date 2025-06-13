/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedContentHashes } from './impl/analyzer.ts';
import type { SignaturePlaceholderToken, SignatureToken } from './tokens.ts';

export interface ContentVerifierIf {
  isValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<boolean>;

  assertIsValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<void>;
}

export type SignedToken = Exclude<SignatureToken, SignaturePlaceholderToken>;

export interface ContentSignerIf<TToken extends SignedToken = SignedToken>
  extends ContentVerifierIf {
  readonly PLACEHOLDER: string;

  sign(hashes: SignedContentHashes): Promise<TToken>;
}
