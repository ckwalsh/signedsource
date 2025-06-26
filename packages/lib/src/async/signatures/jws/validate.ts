/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EmbeddedJWK, flattenedVerify } from 'jose';

import type { SignatureToken, SignedContentHashes } from '../../../types.ts';
import { hexToBase64Url } from '../../../utils/binary/index.ts';
import { getPublicJWK, isJWK } from '../../../utils/keys/index.ts';
import type { ValidatingKey } from '../../../utils/keys/index.ts';
import type { SignedContentValidatorIf } from '../../api/validate.ts';

export interface JwsSignedContentValidatorOptions {
  key: ValidatingKey;
}

export class JwsSignedContentValidator implements SignedContentValidatorIf {
  #validateKey: ValidatingKey;

  constructor(options: JwsSignedContentValidatorOptions) {
    if (isJWK(options.key)) {
      this.#validateKey = getPublicJWK(options.key);
    } else {
      this.#validateKey = options.key;
    }
  }

  async isValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<boolean> {
    if (signature.type !== 'JwsSignatureToken') {
      return false;
    }

    const jws = {
      payload: hexToBase64Url(hashes.sha256),
      protected: signature.base64UrlProtectedHeader,
      signature: signature.base64UrlSignature,
    };
    try {
      // @ts-expect-error Typescript doesn't like the overload of flattenedVerify()
      await flattenedVerify(jws, this.#validateKey);
      return true;
    } catch (_e) {
      return false;
    }
  }

  async assertIsValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<void> {
    if (signature.type !== 'JwsSignatureToken') {
      throw new Error(`Invalid Signature type: ${signature.type}`);
    }

    const jws = {
      payload: hexToBase64Url(hashes.sha256),
      protected: signature.base64UrlProtectedHeader,
      signature: signature.base64UrlSignature,
    };
    try {
      // @ts-expect-error Typescript doesn't like the overload of flattenedVerify()
      await flattenedVerify(jws, this.#validateKey);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Signature validation failed: ${msg}`);
    }
  }
}

export class EmbeddedJwtJwsSignedContentValidator extends JwsSignedContentValidator {
  constructor() {
    super({ key: EmbeddedJWK });
  }
}
