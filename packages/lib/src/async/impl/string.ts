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

export type SignedStringAnalyzerIf = SignedSourceAnalyzerIf<string>;
export type SignedStringValidatorIf = SignedSourceValidatorIf<string>;
export type SignedStringSignerIf = SignedSourceSignerIf<
  string,
  Promise<string>
>;

function stringToStream(source: string): ReadableStream<string> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(source);
      controller.close();
    },
  });
}

export class SignedStringAnalyzer
  extends SignedSourceAnalyzerBase<string>
  implements SignedStringAnalyzerIf
{
  protected _toInputStream(source: string): ReadableStream<string> {
    return stringToStream(source);
  }
}

export class SignedStringValidator
  extends SignedSourceValidatorBase<string>
  implements SignedStringValidatorIf
{
  protected _toInputStream(source: string): ReadableStream<string> {
    return stringToStream(source);
  }
}

export class SignedStringSigner
  extends SignedSourceSignerBase<string>
  implements SignedStringSignerIf
{
  protected _toInputStream(source: string): ReadableStream<string> {
    return stringToStream(source);
  }

  protected async _streamToResult(
    stream: ReadableStream<string>,
  ): Promise<string> {
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return chunks.join('');
  }
}
