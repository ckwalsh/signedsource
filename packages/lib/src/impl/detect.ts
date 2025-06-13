/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { UnderlyingSink } from 'node:stream/web';

import { LEGACY_CONTENT_SIGNER } from '../content/legacy.ts';
import { SignTransformer } from '../stream/sign.ts';
import { UnsignTransformer } from '../stream/unsign.ts';
import type { ContentSignerIf } from '../types/content.ts';
import type { SignedSourceOptions } from '../types/impl/options.ts';
import type { TransformOptions } from '../types/impl/signer.ts';
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

class StringConcatSink implements UnderlyingSink<string> {
  public output = '';
  private chunks: string[] = [];

  write(chunk: string): void {
    this.chunks.push(chunk);
  }
  close(): void {
    this.output = this.chunks.join('');
  }
}

async function streamToString(stream: ReadableStream<string>): Promise<string> {
  const sink = new StringConcatSink();
  await stream.pipeTo(new WritableStream(sink));

  return sink.output;
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

  sign(source: string, options?: TransformOptions): Promise<string>;
  sign(
    source: ReadableStream<string>,
    options?: TransformOptions,
  ): ReadableStream<string>;
  sign(
    source: string | ReadableStream<string>,
    options: TransformOptions = {},
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

  unsign(source: string, options?: TransformOptions): Promise<string>;
  unsign(
    source: ReadableStream<string>,
    options?: TransformOptions,
  ): ReadableStream<string>;
  unsign(
    source: string | ReadableStream<string>,
    options: TransformOptions = {},
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
