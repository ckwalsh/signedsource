/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  MD5SignatureToken,
  SignatureToken,
  SignedContentHashes,
} from '../../types.ts';
import { DEFAULT_PLACEHOLDER_TOKEN } from '../../utils/token.ts';
import type { SignedContentSignerIf } from '../api/sign.ts';
import type { SignedContentValidatorIf } from '../api/validate.ts';

export class MD5SignedContentSignerValidator
  implements SignedContentValidatorIf, SignedContentSignerIf
{
  PLACEHOLDER = DEFAULT_PLACEHOLDER_TOKEN;

  isValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<boolean> {
    return Promise.resolve(
      signature.type === 'MD5SignatureToken' && hashes.md5 === signature.md5sum,
    );
  }

  assertIsValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<void> {
    if (signature.type !== 'MD5SignatureToken') {
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

  sign(hashes: SignedContentHashes): Promise<MD5SignatureToken> {
    return Promise.resolve({
      type: 'MD5SignatureToken',
      md5sum: hashes.md5,
    });
  }
}
