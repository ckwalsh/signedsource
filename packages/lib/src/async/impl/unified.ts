/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { UnderlyingSink } from 'node:stream/web';

import type { SignedSourceSignerOptions } from '../api/sign.ts';
import { SignedSourceAnalyzerBase } from './base/analyze.ts';
import { SignedSourceSignerBase } from './base/sign.ts';
import { SignedSourceValidatorBase } from './base/validate.ts';
import type {
  SignedStreamAnalyzerIf,
  SignedStreamSignerIf,
  SignedStreamValidatorIf,
} from './stream.ts';
import type {
  SignedStringAnalyzerIf,
  SignedStringSignerIf,
  SignedStringValidatorIf,
} from './string.ts';

function sourceToStream(
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

export class SignedSourceAnalyzer
  extends SignedSourceAnalyzerBase<string | ReadableStream<string>>
  implements SignedStringAnalyzerIf, SignedStreamAnalyzerIf
{
  protected _toInputStream(
    source: string | ReadableStream<string>,
  ): ReadableStream<string> {
    return sourceToStream(source);
  }
}

export class SignedSourceValidator
  extends SignedSourceValidatorBase<string | ReadableStream<string>>
  implements SignedStringValidatorIf, SignedStreamValidatorIf
{
  protected _toInputStream(
    source: string | ReadableStream<string>,
  ): ReadableStream<string> {
    return sourceToStream(source);
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

export class SignedSourceSigner
  extends SignedSourceSignerBase<
    string | ReadableStream<string>,
    Promise<string> | ReadableStream<string>
  >
  implements SignedStringSignerIf, SignedStreamSignerIf
{
  override sign(
    source: string,
    options?: Partial<SignedSourceSignerOptions>,
  ): Promise<string>;
  override sign(
    source: ReadableStream<string>,
    options?: Partial<SignedSourceSignerOptions>,
  ): ReadableStream<string>;
  override sign(
    source: string | ReadableStream<string>,
    options: Partial<SignedSourceSignerOptions> = {},
  ): Promise<string> | ReadableStream<string> {
    const stream = this._toSignedStream(source, options);

    if (source instanceof ReadableStream) {
      return stream;
    }

    return streamToString(stream);
  }

  override unsign(
    source: string,
    options?: Partial<SignedSourceSignerOptions>,
  ): Promise<string>;
  override unsign(
    source: ReadableStream<string>,
    options?: Partial<SignedSourceSignerOptions>,
  ): ReadableStream<string>;
  override unsign(
    source: string | ReadableStream<string>,
    options: Partial<SignedSourceSignerOptions> = {},
  ): Promise<string> | ReadableStream<string> {
    const stream = this._toUnsignedStream(source, options);

    if (source instanceof ReadableStream) {
      return stream;
    }

    return streamToString(stream);
  }

  protected _toInputStream(
    source: string | ReadableStream<string>,
  ): ReadableStream<string> {
    return sourceToStream(source);
  }

  protected _streamToResult(
    _stream: ReadableStream<string>,
  ): Promise<string> | ReadableStream<string> {
    throw new Error('Unused');
  }
}
