/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Transformer } from 'node:stream/web';

import { DEFAULT_CONTENT_VERIFIER } from '../content/default.ts';
import { LEGACY_CONTENT_SIGNER } from '../content/legacy.ts';
import {
  MultiplexContentSigner,
  MultiplexContentVerifier,
} from '../content/multiplex.ts';
import { AnalyzeSink } from '../stream/analyze.ts';
import type { Node } from '../stream/nodes.ts';
import { SignTransformer } from '../stream/sign.ts';
import { TokenizeTransformer } from '../stream/tokenizer.ts';
import { UnsignTransformer } from '../stream/unsign.ts';
import type { ContentSignerIf, ContentVerifierIf } from '../types/content.ts';
import type {
  AnalyzeOptions,
  SourceAnalysis,
  SourceAnalyzerIf,
  ValidateOptions,
} from '../types/impl/analyzer.ts';
import { SourceType } from '../types/impl/analyzer.ts';
import type { SignedSourceOptions } from '../types/impl/options.ts';
import type { SourceSignerIf, TransformOptions } from '../types/impl/signer.ts';

export abstract class SourceAnalyzerBase<TSource>
  implements SourceAnalyzerIf<TSource>
{
  readonly #verifier: ContentVerifierIf;

  constructor(options: SignedSourceOptions = {}) {
    let verifiers: ContentVerifierIf[];

    if (options.verifiers !== undefined) {
      verifiers = options.verifiers;
    } else if (options.verifier !== undefined) {
      verifiers = [options.verifier];
    } else {
      verifiers = [];
    }

    if (options.signer !== undefined && !verifiers.includes(options.signer)) {
      verifiers.push(options.signer);
    }

    if (verifiers.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.#verifier = verifiers[0]!;
    } else if (verifiers.length > 1) {
      this.#verifier = new MultiplexContentVerifier({ verifiers });
    } else {
      this.#verifier = DEFAULT_CONTENT_VERIFIER;
    }
  }

  async isGenerated(
    source: TSource,
    options: AnalyzeOptions = {},
  ): Promise<boolean> {
    const analysis = await this.analyze(source, options);

    return analysis.sourceType !== SourceType.MANUAL;
  }

  async isSigned(
    source: TSource,
    options: AnalyzeOptions = {},
  ): Promise<boolean> {
    const analysis = await this.analyze(source, options);

    if (analysis.sourceType === SourceType.MANUAL) {
      return false;
    }

    return analysis.embeddedSignature.type !== 'SignaturePlaceholderToken';
  }

  async isValid(
    source: TSource,
    options: ValidateOptions = {},
  ): Promise<boolean> {
    const analysis = await this.analyze(source, options);

    if (analysis.sourceType === SourceType.MANUAL) {
      return false;
    }

    return await this.#verifier.isValid(
      options.signature ?? analysis.embeddedSignature,
      analysis.contentHashes,
    );
  }

  async assertIsValid(
    source: TSource,
    options: ValidateOptions = {},
  ): Promise<void> {
    const analysis = await this.analyze(source, options);

    if (analysis.sourceType === SourceType.MANUAL) {
      throw new Error('Source is not generated');
    }

    await this.#verifier.assertIsValid(
      options.signature ?? analysis.embeddedSignature,
      analysis.contentHashes,
    );
  }

  async analyze(
    source: TSource,
    options: AnalyzeOptions = {},
  ): Promise<SourceAnalysis> {
    const sink = new AnalyzeSink();

    await this.toTokenStream(source, options).pipeTo(new WritableStream(sink));

    if (sink.analysis === null) {
      throw new Error('Analysis is missing');
    }

    return sink.analysis;
  }

  /** @internal **/
  protected toTokenStream(
    source: TSource,
    options: AnalyzeOptions,
  ): ReadableStream<Node> {
    return this.toInputStream(source).pipeThrough(
      new TransformStream(new TokenizeTransformer(options)),
    );
  }

  /** @internal **/
  protected abstract toInputStream(source: TSource): ReadableStream<string>;
}

export abstract class SourceSignerBase<TSource, TResult = Promise<TSource>>
  extends SourceAnalyzerBase<TSource>
  implements SourceSignerIf<TSource, TResult>
{
  readonly #signer: ContentSignerIf;

  constructor(options: SignedSourceOptions = {}) {
    let verifiers: ContentVerifierIf[];

    if (options.verifiers !== undefined) {
      verifiers = options.verifiers;
    } else if (options.verifier !== undefined) {
      verifiers = [options.verifier];
    } else {
      verifiers = [];
    }

    let superOptions: SignedSourceOptions;
    let signer: ContentSignerIf;

    if (options.signer === undefined) {
      superOptions = { verifiers };

      signer = LEGACY_CONTENT_SIGNER;
    } else {
      signer = options.signer;
      verifiers = verifiers.filter((v) => v !== signer);

      if (verifiers.length > 0) {
        signer = new MultiplexContentSigner({
          signer,
          verifiers,
        });
      }

      superOptions = { verifier: signer };
    }

    super(superOptions);
    this.#signer = signer;
  }

  sign(source: TSource, options: TransformOptions = {}): TResult {
    return this.#transform(
      source,
      options,
      new SignTransformer({ signer: this.#signer, ...options }),
    );
  }

  unsign(source: TSource, options: TransformOptions = {}): TResult {
    return this.#transform(
      source,
      options,
      new UnsignTransformer({ signer: this.#signer, ...options }),
    );
  }

  #transform(
    source: TSource,
    options: AnalyzeOptions,
    transformer: Transformer<Node, string>,
  ): TResult {
    return this.streamToResult(
      this.toTokenStream(source, options).pipeThrough(
        new TransformStream(transformer),
      ),
    );
  }

  /** @internal **/
  protected abstract streamToResult(stream: ReadableStream<string>): TResult;
}
