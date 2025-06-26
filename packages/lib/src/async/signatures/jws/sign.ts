/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JWK, JWSHeaderParameters } from 'jose';
import { FlattenedSign } from 'jose';

import type { JwsSignatureToken, SignedContentHashes } from '../../../types.ts';
import { hexToUint8Array } from '../../../utils/binary/index.ts';
import type { SigningKey } from '../../../utils/keys/index.ts';
import { getPublicJWK, isJWK } from '../../../utils/keys/index.ts';
import { renderPlaceholderToken } from '../../../utils/token.ts';
import type { SignedContentSignerIf } from '../../api/sign.ts';
import { JwsSignedContentValidator } from './validate.ts';

export interface NonJwkJwsSignedContentSignerOptions {
  key: Exclude<SigningKey, JWK>;
  header: JWSHeaderParameters;
}

export interface JwkJwsSignedContentSignerOptions {
  key: JWK;
  header?: JWSHeaderParameters;
  embedKid?: boolean;
  embedJWK?: boolean;
}

export type JwsSignedContentSignerOptions =
  | NonJwkJwsSignedContentSignerOptions
  | JwkJwsSignedContentSignerOptions;

function resolveProtectedHeader(
  opts: JwsSignedContentSignerOptions,
): JWSHeaderParameters {
  const header: JWSHeaderParameters = opts.header ?? {};

  if (!isJWK(opts.key)) {
    return header;
  }

  const options = opts as JwkJwsSignedContentSignerOptions;

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

export async function createJwsContentSigner(
  options: JwsSignedContentSignerOptions,
): Promise<SignedContentSignerIf> {
  const header = resolveProtectedHeader(options);

  const token = await new FlattenedSign(EMPTY_HASH)
    .setProtectedHeader(header)
    .sign(options.key);

  const paddingLength =
    token.signature.length + (token.protected?.length ?? 0) + 1;

  return new JwsSignedContentSigner({
    key: options.key,
    header,
    paddingLength,
  });
}

interface JwsSignedContentSignerImplOptions {
  key: SigningKey;
  header: JWSHeaderParameters;
  paddingLength: number | undefined;
}

class JwsSignedContentSigner
  extends JwsSignedContentValidator
  implements SignedContentSignerIf
{
  readonly PLACEHOLDER: string;

  #signingKey: SigningKey;
  #header: JWSHeaderParameters;

  constructor(options: JwsSignedContentSignerImplOptions) {
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
