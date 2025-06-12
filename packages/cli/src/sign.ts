/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Command, Option } from 'clipanion';
import fs from 'fs/promises';
import type { JWK } from 'jose';

import type { TransformOptions } from '@ckwalsh/signedsource';
import {
  StreamSourceSigner,
  createJWSContentSigner,
} from '@ckwalsh/signedsource';

import { TransformCommandBase } from './base.ts';

export class SignCommand extends TransformCommandBase {
  static override paths = [['sign'], Command.Default];
  static override usage = Command.Usage({
    description: 'Sign generated source code',
    details: `
      This command is used to sign @generated and @partially-generated source,
      allowing accidental modifications to be detected.

      Source code can be provided from a file argument or piped to stdin.

      By default, files are transformed in place and source piped to stdin is
      printed to stdout. The output may be directed to a different file using
      the --output flag, or to stdout by using the special value "-".

      By default, files are signed using with the md5 hash of their contents,
      backwards compatible with the signedsource library released by Meta and
      used by Relay. This is not cryptographically secure, and files could be
      re-signed by anyone.
      
      If a file containing a JSON Web Key (JWK) is provided using the --jwk
      flag, a cryptographically secure signature will be used. This is not
      backwards compatible with Meta's signedsource library.
      
      If the --embed-jwk flag is set in combination with a JWK file, the public
      key will be embedded in the signed file, enabling verification without
      the original key material.
    `,
    examples: [
      ['Sign a file in place', '$0 sign source.js'],
      [
        'Sign a file with an output path',
        '$0 sign --output signed.js unsigned.js',
      ],
      ['Sign a file to stdout', '$0 sign --output - source.js'],
      ['Sign from stdin', '$0 sign < source.js'],
      ['Sign using a JWK', '$0 sign --jwk key.private.json source.js'],
      [
        'Embed the JWK in the signed file',
        '$0 sign --jwk key.private.json --embed-jwk source.js',
      ],
    ],
  });

  jwkPath = Option.String('-k,--jwk');
  embedJWK = Option.Boolean('-e,--embed-jwk', false);

  protected async _getTransformStream(
    input: ReadableStream<string>,
  ): Promise<ReadableStream<string>> {
    const options: TransformOptions = {};

    if (this.jwkPath) {
      const key = JSON.parse(await fs.readFile(this.jwkPath, 'utf-8')) as JWK;
      const signer = await createJWSContentSigner({
        key,
        embedJWK: this.embedJWK,
      });
      options.signer = signer;
    }

    const signer = new StreamSourceSigner();

    return signer.sign(input, options);
  }
}
