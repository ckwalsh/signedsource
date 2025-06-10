/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignTransformerOptions } from '../../stream/sign.ts';
import type { UnsignTransformerOptions } from '../../stream/unsign.ts';
import type { SourceAnalyzerIf, SourceType } from './analyzer.ts';

interface FullyGeneratedOptions {
  sourceType: SourceType.GENERATED;
  manualSectionOverrides?: never;
}
interface PartiallyGeneratedOptions {
  sourceType: SourceType.PARTIALLY_GENERATED;
  manualSectionOverrides?: Record<string, string>;
}
interface AutoDetectOptions {
  sourceType?: never;
  manualSectionOverrides?: Record<string, string>;
}

type SourceTypeOptions =
  | FullyGeneratedOptions
  | PartiallyGeneratedOptions
  | AutoDetectOptions;

export type SignOptions = SourceTypeOptions & Partial<SignTransformerOptions>;
export type UnsignOptions = SourceTypeOptions &
  Partial<UnsignTransformerOptions>;

export interface SourceSignerIf<TSource, TResult = Promise<TSource>>
  extends SourceAnalyzerIf<TSource> {
  sign(source: TSource, options?: SignOptions): TResult;
  unsign(source: TSource, options?: UnsignOptions): TResult;
}
