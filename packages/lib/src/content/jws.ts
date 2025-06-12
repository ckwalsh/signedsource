/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { hexToBase64Url, hexToUint8Array } from '#src/utils/binary.ts';
import type { SigningKey, VerifyKey } from '#src/utils/keys.ts';
import { isJWK } from '#src/utils/keys.ts';
import type { JWK, JWSHeaderParameters } from 'jose';
import { EmbeddedJWK, FlattenedSign, flattenedVerify } from 'jose';

import { renderPlaceholderToken } from '../token.ts';
import type { ContentSignerIf, ContentVerifierIf } from '../types/content.ts';
import type { SignedContentHashes } from '../types/impl/analyzer.ts';
import type { JwsSignatureToken, SignatureToken } from '../types/tokens.ts';

export type { SigningKey, VerifyKey } from '#src/utils/keys.ts';

export interface JWSContentVerifierOptions {
  key: VerifyKey;
}

function getPublicJWK(jwk: JWK): JWK {
  const { d, dp, dq, p, q, qi, ...pubKey } = jwk;

  return pubKey;
}

export class JWSContentVerifier implements ContentVerifierIf {
  #verifyKey: VerifyKey;

  constructor(options: JWSContentVerifierOptions) {
    if (isJWK(options.key)) {
      this.#verifyKey = getPublicJWK(options.key);
    } else {
      this.#verifyKey = options.key;
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
      await flattenedVerify(jws, this.#verifyKey);
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
    // @ts-expect-error Typescript doesn't like the overload of flattenedVerify()
    await flattenedVerify(jws, this.#verifyKey);
  }
}

export interface JWSContentSignerExplicitHeaderOptions {
  key: Exclude<SigningKey, JWK>;
  header: JWSHeaderParameters;
}

export interface JWSContentSignerJWKOptions {
  key: JWK;
  header?: JWSHeaderParameters;
  embedKid?: boolean;
  embedJWK?: boolean;
}

export type JWSContentSignerOptions =
  | JWSContentSignerExplicitHeaderOptions
  | JWSContentSignerJWKOptions;

function resolveProtectedHeader(
  opts: JWSContentSignerOptions,
): JWSHeaderParameters {
  const header: JWSHeaderParameters = opts.header ?? {};

  if (!isJWK(opts.key)) {
    return header;
  }

  const options = opts as JWSContentSignerJWKOptions;

  if (options.key.alg !== undefined) {
    header.alg ??= options.key.alg;
  }

  if (options.embedKid ?? true) {
    if (options.key.kid !== undefined) {
      header.kid ??= options.key.kid;
    }
  }

  if (options.embedJWK ?? false) {
    header.jwk = getPublicJWK(options.key);
  }

  return header;
}

const EMPTY_HASH = new Uint8Array(32); // Length of sha256 hash

export async function createJWSContentSigner(
  options: JWSContentSignerOptions,
): Promise<ContentSignerIf> {
  const header = resolveProtectedHeader(options);

  const token = await new FlattenedSign(EMPTY_HASH)
    .setProtectedHeader(header)
    .sign(options.key);

  const paddingLength =
    token.signature.length + (token.protected?.length ?? 0) + 1;

  return new JWSContentSigner({ key: options.key, header, paddingLength });
}

interface JWSContentSignerImplOptions {
  key: SigningKey;
  header: JWSHeaderParameters;
  paddingLength: number | undefined;
}

class JWSContentSigner extends JWSContentVerifier implements ContentSignerIf {
  readonly PLACEHOLDER: string;

  #signingKey: SigningKey;
  #header: JWSHeaderParameters;

  constructor(options: JWSContentSignerImplOptions) {
    super(options);

    this.PLACEHOLDER = renderPlaceholderToken({
      type: 'SignaturePlaceholderToken',
      paddingLength: options.paddingLength,
    });

    this.#signingKey = options.key;
    this.#header = options.header;
  }

  async sign(hashes: SignedContentHashes): Promise<JwsSignatureToken> {
    const payload = hexToUint8Array(hashes.sha256);

    const token = await new FlattenedSign(payload)
      .setProtectedHeader(this.#header)
      .sign(this.#signingKey);

    return {
      type: 'JwsSignatureToken',
      base64UrlProtectedHeader: token.protected ?? '',
      base64UrlSignature: token.signature,
    };
  }
}

export class EmbeddedJWTContentVerifier extends JWSContentVerifier {
  constructor() {
    super({ key: EmbeddedJWK });
  }
}

export const EMBEDDED_JWT_CONTENT_VERIFIER = new EmbeddedJWTContentVerifier();
