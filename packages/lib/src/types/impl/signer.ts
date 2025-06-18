/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ContentSignerIf } from '../content.ts';
import type { SourceAnalyzerIf } from './analyzer.ts';

export interface FullyGeneratedOptions {
  sourceType: 'generated';
  signer?: ContentSignerIf;
  manualSectionOverrides?: never;
}

export interface PartiallyGeneratedOptions {
  sourceType: 'partially-generated';
  signer?: ContentSignerIf;
  manualSectionOverrides?: Record<string, string>;
}

export interface AutoDetectOptions {
  sourceType?: never;
  signer?: ContentSignerIf;
  manualSectionOverrides?: Record<string, string>;
}

export type TransformOptions =
  | FullyGeneratedOptions
  | PartiallyGeneratedOptions
  | AutoDetectOptions;

export interface SourceSignerIf<TSource, TResult = Promise<TSource>>
  extends SourceAnalyzerIf<TSource> {
  sign(source: TSource, options?: TransformOptions): TResult;
  unsign(source: TSource, options?: TransformOptions): TResult;
}
