/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedSourceAnalysis } from '../../../types.ts';
import type { HasherIf } from '../../../utils/hasher/index.ts';
import type {
  SignedSourceAnalyzerDefaultOptions,
  SignedSourceAnalyzerIf,
  SignedSourceAnalyzerOptions,
} from '../../api/analyze.ts';
import type { AnalyzeSinkOptions } from '../../stream/analyze.ts';
import { AnalyzeSink } from '../../stream/analyze.ts';
import type { Node } from '../../stream/nodes.ts';
import { TokenizeTransformer } from '../../stream/tokenizer.ts';

const IS_PRODUCTION = process.env['NODE_ENV'] === 'production';

export abstract class SignedSourceAnalyzerBase<TSource>
  implements SignedSourceAnalyzerIf<TSource>
{
  protected readonly _sourceType: SignedSourceAnalyzerOptions['sourceType'];

  constructor(defaults: SignedSourceAnalyzerDefaultOptions = {}) {
    this._sourceType = defaults.sourceType;
  }

  async isGenerated(
    source: TSource,
    options: Partial<SignedSourceAnalyzerOptions> = {},
  ): Promise<boolean> {
    const analysis = await this.analyze(source, options);

    return analysis.sourceType !== 'manual';
  }

  async isSigned(
    source: TSource,
    options: Partial<SignedSourceAnalyzerOptions> = {},
  ): Promise<boolean> {
    const analysis = await this.analyze(source, options);

    if (analysis.sourceType === 'manual') {
      return false;
    }

    return analysis.embeddedSignature.type !== 'SignaturePlaceholderToken';
  }

  async analyze(
    source: TSource,
    options: Partial<SignedSourceAnalyzerOptions> = {},
  ): Promise<SignedSourceAnalysis> {
    const analyzerSinkOptions: AnalyzeSinkOptions = {};

    if (!IS_PRODUCTION) {
      analyzerSinkOptions.__hasherFnForTesting = this.__hasherFnForTesting;
    }

    const sink = new AnalyzeSink(analyzerSinkOptions);

    await this._toTokenStream(source, options).pipeTo(new WritableStream(sink));

    if (sink.analysis === null) {
      throw new Error('Analysis is missing');
    }

    return sink.analysis;
  }

  /** @internal */
  public __hasherFnForTesting: (() => HasherIf) | undefined = undefined;

  /** @internal **/
  protected _toTokenStream(
    source: TSource,
    options: Partial<SignedSourceAnalyzerOptions>,
  ): ReadableStream<Node> {
    return this._toInputStream(source).pipeThrough(
      new TransformStream(
        new TokenizeTransformer({ sourceType: this._sourceType, ...options }),
      ),
    );
  }

  /** @internal **/
  protected abstract _toInputStream(source: TSource): ReadableStream<string>;
}
