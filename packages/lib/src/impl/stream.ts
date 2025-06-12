/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SourceAnalyzerIf } from '../types/impl/analyzer.ts';
import type { SourceSignerIf } from '../types/impl/signer.ts';
import { SourceAnalyzerBase, SourceSignerBase } from './base.ts';

/** @inline **/
type StringStream = ReadableStream<string>;
export type StreamSourceAnalyzerIf = SourceAnalyzerIf<StringStream>;
export type StreamSourceSignerIf = SourceSignerIf<StringStream, StringStream>;

export class StreamSourceAnalyzer extends SourceAnalyzerBase<StringStream> {
  protected toInputStream(source: StringStream): StringStream {
    return source;
  }
}

export class StreamSourceSigner extends SourceSignerBase<
  StringStream,
  StringStream
> {
  protected toInputStream(source: StringStream): StringStream {
    return source;
  }

  protected streamToResult(stream: StringStream): StringStream {
    return stream;
  }
}
