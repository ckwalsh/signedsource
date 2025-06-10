/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  ContentSignerIf,
  ContentVerifierIf,
  SignedToken,
} from '../types/content.ts';
import type { SignedContentHashes } from '../types/impl/analyzer.ts';
import type { SignatureToken } from '../types/tokens.ts';

export interface MultiplexContentVerifierOptions {
  verifiers: ContentVerifierIf[];
}

export class MultiplexContentVerifier implements ContentVerifierIf {
  #verifiers: ContentVerifierIf[];

  constructor(options: MultiplexContentVerifierOptions) {
    this.#verifiers = options.verifiers;
  }

  async isValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<boolean> {
    for (const verifier of this.#verifiers) {
      if (await verifier.isValid(signature, hashes)) {
        return true;
      }
    }

    return false;
  }

  assertIsValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<void> {
    return Promise.any(
      this.#verifiers.map((verifier) =>
        verifier.assertIsValid(signature, hashes),
      ),
    );
  }
}

export interface MultiplexContentSignerOptions<TToken extends SignedToken> {
  signer: ContentSignerIf<TToken>;
  verifiers: ContentVerifierIf[];
}

export class MultiplexContentSigner<TToken extends SignedToken>
  extends MultiplexContentVerifier
  implements ContentSignerIf
{
  readonly PLACEHOLDER: string;
  #signer: ContentSignerIf<TToken>;

  constructor(options: MultiplexContentSignerOptions<TToken>) {
    const verifiers = options.verifiers;

    if (!verifiers.includes(options.signer)) {
      verifiers.push(options.signer);
    }

    super({ verifiers });

    this.PLACEHOLDER = options.signer.PLACEHOLDER;
    this.#signer = options.signer;
  }

  sign(hashes: SignedContentHashes): Promise<TToken> {
    return this.#signer.sign(hashes);
  }
}
