/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LEGACY_CONTENT_SIGNER } from '../content/legacy.ts';
import { SignTransformer } from '../stream/sign.ts';
import { UnsignTransformer } from '../stream/unsign.ts';
import type { ContentSignerIf } from '../types/content.ts';
import type { SignedSourceOptions } from '../types/impl/options.ts';
import type { SignOptions, UnsignOptions } from '../types/impl/signer.ts';
import { SourceAnalyzerBase } from './base.ts';
import type { StreamSourceAnalyzerIf, StreamSourceSignerIf } from './stream.ts';
import type { StringSourceAnalyzerIf, StringSourceSignerIf } from './string.ts';

export class SourceAnalyzer
  extends SourceAnalyzerBase<string | ReadableStream<string>>
  implements StringSourceAnalyzerIf, StreamSourceAnalyzerIf
{
  protected toInputStream(
    source: string | ReadableStream<string>,
  ): ReadableStream<string> {
    if (source instanceof ReadableStream) {
      return source;
    }

    return new ReadableStream({
      start(controller) {
        controller.enqueue(source);
        controller.close();
      },
    });
  }
}

async function streamToString(stream: ReadableStream<string>): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks.join('');
}

export class SourceSigner
  extends SourceAnalyzer
  implements StringSourceSignerIf, StreamSourceSignerIf
{
  readonly #signer: ContentSignerIf;

  constructor(options: SignedSourceOptions = {}) {
    super(options);
    this.#signer = options.signer ?? LEGACY_CONTENT_SIGNER;
  }

  sign(source: string, options?: SignOptions): Promise<string>;
  sign(
    source: ReadableStream<string>,
    options?: SignOptions,
  ): ReadableStream<string>;
  sign(
    source: string | ReadableStream<string>,
    options: SignOptions = {},
  ): Promise<string> | ReadableStream<string> {
    const stream = this.toTokenStream(source, options).pipeThrough(
      new TransformStream(
        new SignTransformer({ signer: this.#signer, ...options }),
      ),
    );

    if (source instanceof ReadableStream) {
      return stream;
    }

    return streamToString(stream);
  }

  unsign(source: string, options?: UnsignOptions): Promise<string>;
  unsign(
    source: ReadableStream<string>,
    options?: UnsignOptions,
  ): ReadableStream<string>;
  unsign(
    source: string | ReadableStream<string>,
    options: UnsignOptions = {},
  ): Promise<string> | ReadableStream<string> {
    const stream = this.toTokenStream(source, options).pipeThrough(
      new TransformStream(
        new UnsignTransformer({ signer: this.#signer, ...options }),
      ),
    );

    if (source instanceof ReadableStream) {
      return stream;
    }

    return streamToString(stream);
  }
}
