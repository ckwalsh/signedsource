/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedStringSignerIf } from '../../src/index.ts';

export type SourceProviderFn<T> = () => Promise<T>;

export interface ContentStream {
  readonly label: string;
  readonly getStream: SourceProviderFn<ReadableStream<string>>;
}

export interface SourceProviderIf {
  readonly getString: SourceProviderFn<string>;
  readonly streams: readonly ContentStream[];
}

export class SignedSourceProvider implements SourceProviderIf {
  readonly getString: SourceProviderFn<string>;
  readonly streams: readonly ContentStream[];

  constructor(signer: SignedStringSignerIf, unsigned: string) {
    this.getString = () => signer.sign(unsigned);
    this.streams = [
      {
        label: 'single chunk stream',
        getStream: async () => {
          const signed = await signer.sign(unsigned);
          return new ReadableStream({
            start(controller) {
              controller.enqueue(signed);
              controller.close();
            },
          });
        },
      },
      {
        label: 'single character stream',
        getStream: async () => {
          const signed = await signer.sign(unsigned);
          return ReadableStream.from(signed);
        },
      },
    ];
  }
}

export async function streamToString(
  stream: ReadableStream<string>,
): Promise<string> {
  const chunks: string[] = [];

  await stream.pipeTo(
    new WritableStream({
      write(chunk: string): void {
        chunks.push(chunk);
      },
    }),
  );

  return chunks.join('');
}
