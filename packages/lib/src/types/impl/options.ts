/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ContentSignerIf, ContentVerifierIf } from '../content.ts';

interface SingleVerifierOptions {
  verifier?: ContentVerifierIf;
  verifiers?: never;
}

interface MultiVerifierOptions {
  verifier?: never;
  verifiers?: ContentVerifierIf[];
}

type VerifierOptions = SingleVerifierOptions | MultiVerifierOptions;

interface SignerOptions {
  signer?: ContentSignerIf;
}

export type SignedSourceOptions = VerifierOptions & SignerOptions;
