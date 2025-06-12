/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Command } from 'clipanion';

import { StreamSourceSigner } from '@ckwalsh/signedsource';

import { TransformCommandBase } from './base.ts';

export class UnsignCommand extends TransformCommandBase {
  static override paths = [['unsign']];
  static override usage = Command.Usage({
    description: 'Unsign generated source code',
    details: `
      This command is used to remove signatures from @generated and
      @partially-generated source, allowing files to be modified manually.
      
      Source code can be provided from a file argument or piped to stdin.

      By default, files are transformed in place and source piped to stdin is
      printed to stdout. The output may be directed to a different file using
      the --output flag, or to stdout by using the special value "-".
    `,
    examples: [
      ['Unsign a file in place', '$0 unsign source.js'],
      [
        'Unsign a file with an output path',
        '$0 unsign --output unsigned.js signed.js',
      ],
      ['Unsign a file to stdout', '$0 unsign --output - source.js'],
      ['Unsign from stdin', '$0 unsign < source.js'],
    ],
  });

  protected _getTransformStream(
    input: ReadableStream<string>,
  ): Promise<ReadableStream<string>> {
    const signer = new StreamSourceSigner();

    return Promise.resolve(signer.unsign(input));
  }
}
