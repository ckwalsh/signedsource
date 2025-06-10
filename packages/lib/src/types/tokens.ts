/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface SignatureTokenBase {
  type: SignatureToken['type'];
}

export interface SignaturePlaceholderToken extends SignatureTokenBase {
  type: 'SignaturePlaceholderToken';
  paddingLength?: number | undefined;
}

export interface LegacySignatureToken extends SignatureTokenBase {
  type: 'LegacySignatureToken';
  md5sum: string;
}

export interface JwsSignatureToken extends SignatureTokenBase {
  type: 'JwsSignatureToken';
  base64UrlProtectedHeader: string;
  base64UrlSignature: string;
}

export type SignatureToken =
  | SignaturePlaceholderToken
  | LegacySignatureToken
  | JwsSignatureToken;

export type EmbeddedSignatureToken = SignatureToken & {
  start: number;
  end: number;
};
