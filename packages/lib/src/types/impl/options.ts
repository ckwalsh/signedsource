/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ContentSignerIf, ContentVerifierIf } from '../content.ts';

export interface SingleVerifierOptions {
  signer?: ContentSignerIf;
  verifier?: ContentVerifierIf;
  verifiers?: never;
}

export interface MultiVerifierOptions {
  signer?: ContentSignerIf;
  verifier?: never;
  verifiers?: ContentVerifierIf[];
}

export type SignedSourceOptions = SingleVerifierOptions | MultiVerifierOptions;
