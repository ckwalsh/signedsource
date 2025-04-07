/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile, writeFile } from 'fs/promises';
import { Command, Option } from 'clipanion';
import { signSource } from '@ckwalsh/signedsource';

export class SignCommand extends Command {
  static paths = [['sign'], Command.Default];
  file = Option.String();
  outFile = Option.String(`-o,--outFile`);

  async execute() {
    const unsigned = await readFile(this.file, 'utf-8');
    const signed = signSource(unsigned);

    const outFile = this.outFile ?? this.file;

    if (outFile === '-') {
      this.context.stdout.write(signed);
    } else {
      await writeFile(outFile, signed);
    }
  }
}
