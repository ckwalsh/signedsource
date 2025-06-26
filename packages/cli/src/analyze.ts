/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Command } from 'clipanion';

import { SignedStreamAnalyzer } from '@ckwalsh/signedsource';

import { SignedSourceCommandBase } from './base.ts';

export class AnalyzeCommand extends SignedSourceCommandBase {
  static override paths = [['analyze']];
  static override usage = Command.Usage({
    description: 'Analyze the signature of generated source code',
    details: `
      This command outputs the result of SignedSourceAnalyzer.analyze() on
      provided source code as JSON, to help debug issues with generated/signed
      source.

      Source code can be provided from a file argument or piped to stdin.
    `,
    examples: [
      ['Analyze a file', '$0 analyze source.js'],
      ['Analyze from stdin', '$0 analyze < source.js'],
    ],
  });

  async execute() {
    const input = await this._getInputStream();

    const analyzer = new SignedStreamAnalyzer();

    const analysis = await analyzer.analyze(input);

    this.context.stdout.write(JSON.stringify(analysis, null, 2) + '\n');
  }
}
