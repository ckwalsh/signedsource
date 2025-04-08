/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'fs/promises';
import { Command, Option } from 'clipanion';
import 'colors';

import { UnsignedDataError, verifySignedSource } from '@ckwalsh/signedsource';

export class VerifyCommand extends Command {
  static paths = [['verify']];
  file = Option.String();
  quiet = Option.Boolean(`-q,--quiet`);

  async execute() {
    const signed = await readFile(this.file, 'utf-8');

    try {
      if (verifySignedSource(signed)) {
        if (!this.quiet) {
          this.context.stdout.write(`Signature valid for ${this.file}\n`.green);
        }
      } else {
        if (!this.quiet) {
          this.context.stdout.write(`Invalid signature for ${this.file}\n`.red);
        }

        return 1;
      }
    } catch (e) {
      if (e instanceof UnsignedDataError) {
        if (!this.quiet) {
          this.context.stdout.write(`No signature found for ${this.file}\n`.yellow);
        }
      }
    }
  }
}
