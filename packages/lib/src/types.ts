/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export type SourceType = 'generated' | 'partially-generated' | 'manual';

export interface SignedContentHashes {
  sha256: string;
  md5: string;
}

export interface FullyGeneratedSourceAnalysis {
  sourceType: 'generated';
  manualSections?: never;
  embeddedSignature: EmbeddedSignatureToken;
  contentHashes: SignedContentHashes;
}

export interface PartiallyGeneratedSourceAnalysis {
  sourceType: 'partially-generated';
  manualSections: Record<string, string>;
  embeddedSignature: EmbeddedSignatureToken;
  contentHashes: SignedContentHashes;
}

export interface ManualSourceAnalysis {
  sourceType: 'manual';
  manualSections?: never;
  embeddedSignature?: never;
  contentHashes?: never;
}

export type SignedSourceAnalysis =
  | FullyGeneratedSourceAnalysis
  | PartiallyGeneratedSourceAnalysis
  | ManualSourceAnalysis;

/** @inline */
interface SignatureTokenBase {
  type: SignatureToken['type'];
}

export interface SignaturePlaceholderToken extends SignatureTokenBase {
  type: 'SignaturePlaceholderToken';
  paddingLength?: number | undefined;
}

export interface MD5SignatureToken extends SignatureTokenBase {
  type: 'MD5SignatureToken';
  md5sum: string;
}

export interface JwsSignatureToken extends SignatureTokenBase {
  type: 'JwsSignatureToken';
  base64UrlProtectedHeader: string;
  base64UrlSignature: string;
}

export type SignatureToken =
  | SignaturePlaceholderToken
  | MD5SignatureToken
  | JwsSignatureToken;

export type SignedSignatureToken = MD5SignatureToken | JwsSignatureToken;

export interface EmbeddedSignatureTokenPosition {
  start: number;
  end: number;
}

export type EmbeddedSignatureToken = SignatureToken &
  EmbeddedSignatureTokenPosition;
