/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs/promises';

import type {
  ContentStream,
  SourceProviderFn,
  SourceProviderIf,
} from '../../utils/source.ts';
import type { ResolvedFixtureTestCase } from './case.ts';

export class FixtureFileSourceProvider implements SourceProviderIf {
  readonly getString: SourceProviderFn<string>;
  readonly streams: readonly ContentStream[];

  constructor({ absPath }: ResolvedFixtureTestCase) {
    this.getString = () => fs.readFile(absPath, 'utf8');
    this.streams = [
      {
        label: 'file stream',
        getStream: async () => {
          const fh = await fs.open(absPath, 'r');
          return fh
            .readableWebStream()
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(
              new TransformStream({
                async flush() {
                  await fh.close();
                },
              }),
            ) as ReadableStream<string>;
        },
      },
      {
        label: 'character stream',
        getStream: async () => {
          const source = await fs.readFile(absPath, 'utf8');

          return ReadableStream.from(source);
        },
      },
    ];
  }
}
