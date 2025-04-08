/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'fs/promises';
import { Command, Option } from 'clipanion';
import { verifySignedSource } from '@ckwalsh/signedsource';

export class VerifyCommand extends Command {
  static paths = [['verify']];
  file = Option.String();
  quiet = Option.Boolean(`-q,--quiet`);

  async execute() {
    const signed = await readFile(this.file, 'utf-8');

    if (verifySignedSource(signed)) {
      if (!this.quiet) {
        this.context.stdout.write('Signature is Valid');
      }
    } else {
      if (!this.quiet) {
        this.context.stdout.write('Invalid signature');
      }

      return 1;
    }
  }
}
