/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { EmbeddedSignatureToken, SignatureToken } from '../tokens.ts';

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

export type SourceAnalysis =
  | FullyGeneratedSourceAnalysis
  | PartiallyGeneratedSourceAnalysis
  | ManualSourceAnalysis;

export interface AnalyzeOptions {
  sourceType?: Exclude<SourceType, 'manual'>;
}

export interface ValidateOptions extends AnalyzeOptions {
  signature?: SignatureToken;
}

export interface SourceAnalyzerIf<TSource> {
  isGenerated(source: TSource, options?: AnalyzeOptions): Promise<boolean>;
  isSigned(source: TSource, options?: AnalyzeOptions): Promise<boolean>;

  isValid(source: TSource, options?: ValidateOptions): Promise<boolean>;
  assertIsValid(source: TSource, options?: ValidateOptions): Promise<void>;

  analyze(source: TSource, options?: AnalyzeOptions): Promise<SourceAnalysis>;
}
