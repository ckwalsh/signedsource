/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  SIGNED_TOKEN_PREFIX,
  TOKEN_PADDING_SEQUENCE,
  TOKEN_SUFFIX,
  UNSIGNED_TOKEN_PREFIX,
} from '../constants.ts';
import type { SignatureToken } from '../types.ts';

export const DEFAULT_PLACEHOLDER_TOKEN =
  UNSIGNED_TOKEN_PREFIX + TOKEN_PADDING_SEQUENCE + TOKEN_SUFFIX;

export function renderToken(token: SignatureToken): string {
  switch (token.type) {
    case 'SignaturePlaceholderToken':
      if (
        token.paddingLength === undefined ||
        token.paddingLength === TOKEN_PADDING_SEQUENCE.length
      ) {
        return DEFAULT_PLACEHOLDER_TOKEN;
      }

      return [
        UNSIGNED_TOKEN_PREFIX,
        renderPlaceholderPadding(token.paddingLength),
        TOKEN_SUFFIX,
      ].join('');
    case 'MD5SignatureToken':
      return [SIGNED_TOKEN_PREFIX, token.md5sum, TOKEN_SUFFIX].join('');
    case 'JwsSignatureToken':
      return [
        SIGNED_TOKEN_PREFIX,
        token.base64UrlProtectedHeader,
        '.',
        token.base64UrlSignature,
        TOKEN_SUFFIX,
      ].join('');
  }
}

export function renderPlaceholderToken(token: SignatureToken): string {
  switch (token.type) {
    case 'SignaturePlaceholderToken':
      if (
        token.paddingLength === undefined ||
        token.paddingLength === TOKEN_PADDING_SEQUENCE.length
      ) {
        return DEFAULT_PLACEHOLDER_TOKEN;
      }

      return [
        UNSIGNED_TOKEN_PREFIX,
        renderPlaceholderPadding(token.paddingLength),
        TOKEN_SUFFIX,
      ].join('');
    case 'MD5SignatureToken':
      return DEFAULT_PLACEHOLDER_TOKEN;
    case 'JwsSignatureToken': {
      const paddingLength =
        token.base64UrlProtectedHeader.length +
        token.base64UrlSignature.length +
        1;
      return [
        UNSIGNED_TOKEN_PREFIX,
        renderPlaceholderPadding(paddingLength),
        TOKEN_SUFFIX,
      ].join('');
    }
  }
}

export function parseToken(rawToken: string): SignatureToken {
  if (rawToken.startsWith(SIGNED_TOKEN_PREFIX)) {
    const match = TOKEN_REGEX.exec(rawToken);
    if (!match) {
      throw new Error(`Invalid signature token: ${rawToken}`);
    }

    const md5sum = match[1];
    if (md5sum !== undefined) {
      return {
        type: 'MD5SignatureToken',
        md5sum,
      };
    }

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return {
      type: 'JwsSignatureToken',
      base64UrlProtectedHeader: match[2]!,
      base64UrlSignature: match[3]!,
    };
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  } else if (rawToken.startsWith(UNSIGNED_TOKEN_PREFIX)) {
    const match = UNSIGNED_REGEX.exec(rawToken);
    if (!match) {
      throw new Error(`Invalid signature token: ${rawToken}`);
    }

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return {
      type: 'SignaturePlaceholderToken',
      paddingLength: match[1]!.length,
    };
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }

  throw new Error(`Invalid signature token: ${rawToken}`);
}

const PADDING_LENGTH_DELTA =
  SIGNED_TOKEN_PREFIX.length - UNSIGNED_TOKEN_PREFIX.length;

function renderPlaceholderPadding(length: number): string {
  const paddingLength = Math.max(length + PADDING_LENGTH_DELTA, 0);

  return TOKEN_PADDING_SEQUENCE.repeat(
    Math.ceil(paddingLength / TOKEN_PADDING_SEQUENCE.length),
  ).slice(0, paddingLength);
}

const TOKEN_REGEX =
  /^SignedSource<<(?:([0-9a-f]+)|(?:([0-9a-zA-Z_-]+)\.([0-9a-zA-Z_-]+)))>>$/;
const UNSIGNED_REGEX = /^<<SignedSource::([0-9a-zA-Z*#+!@]*)>>$/;
