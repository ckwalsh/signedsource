/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SourceAnalyzerIf } from '../types/impl/analyzer.ts';
import type { SourceSignerIf } from '../types/impl/signer.ts';
import { SourceAnalyzerBase, SourceSignerBase } from './base.ts';

export type StringSourceAnalyzerIf = SourceAnalyzerIf<string>;
export type StringSourceSignerIf = SourceSignerIf<string>;

export class StringSourceAnalyzer extends SourceAnalyzerBase<string> {
  protected toInputStream(source: string): ReadableStream<string> {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(source);
        controller.close();
      },
    });
  }
}

export class StringSourceSigner extends SourceSignerBase<string> {
  protected toInputStream(source: string): ReadableStream<string> {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(source);
        controller.close();
      },
    });
  }

  protected async streamToResult(
    stream: ReadableStream<string>,
  ): Promise<string> {
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return chunks.join('');
  }
}
