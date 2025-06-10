/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEFAULT_PLACEHOLDER_TOKEN } from '../token.ts';
import type { ContentSignerIf } from '../types/content.ts';
import type { SignedContentHashes } from '../types/impl/analyzer.ts';
import type { LegacySignatureToken, SignatureToken } from '../types/tokens.ts';

export class LegacyContentSigner implements ContentSignerIf {
  PLACEHOLDER = DEFAULT_PLACEHOLDER_TOKEN;

  isValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<boolean> {
    return Promise.resolve(
      signature.type === 'LegacySignatureToken' &&
        hashes.md5 === signature.md5sum,
    );
  }

  assertIsValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<void> {
    if (signature.type !== 'LegacySignatureToken') {
      return Promise.reject(
        new Error(`Invalid Signature type: ${signature.type}`),
      );
    }

    if (hashes.md5 !== signature.md5sum) {
      return Promise.reject(
        new Error(`Hash Mismatch: ${hashes.md5} !== ${signature.md5sum}`),
      );
    }

    return Promise.resolve();
  }

  sign(hashes: SignedContentHashes): Promise<LegacySignatureToken> {
    return Promise.resolve({
      type: 'LegacySignatureToken',
      md5sum: hashes.md5,
    });
  }
}

export const LEGACY_CONTENT_SIGNER = new LegacyContentSigner();
