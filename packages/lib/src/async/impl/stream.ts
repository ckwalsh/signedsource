/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedSourceAnalyzerIf } from '../api/analyze.ts';
import type { SignedSourceSignerIf } from '../api/sign.ts';
import type { SignedSourceValidatorIf } from '../api/validate.ts';
import { SignedSourceAnalyzerBase } from './base/analyze.ts';
import { SignedSourceSignerBase } from './base/sign.ts';
import { SignedSourceValidatorBase } from './base/validate.ts';

/** @inline **/
type StringStream = ReadableStream<string>;

export type SignedStreamAnalyzerIf = SignedSourceAnalyzerIf<StringStream>;
export type SignedStreamValidatorIf = SignedSourceValidatorIf<StringStream>;
export type SignedStreamSignerIf = SignedSourceSignerIf<
  StringStream,
  StringStream
>;

export class SignedStreamAnalyzer
  extends SignedSourceAnalyzerBase<StringStream>
  implements SignedStreamAnalyzerIf
{
  protected _toInputStream(source: StringStream): StringStream {
    return source;
  }
}

export class SignedStreamValidator
  extends SignedSourceValidatorBase<StringStream>
  implements SignedStreamValidatorIf
{
  protected _toInputStream(source: StringStream): StringStream {
    return source;
  }
}

export class SignedStreamSigner
  extends SignedSourceSignerBase<StringStream, StringStream>
  implements SignedStreamSignerIf
{
  protected _toInputStream(source: StringStream): StringStream {
    return source;
  }

  protected _streamToResult(stream: StringStream): StringStream {
    return stream;
  }
}
