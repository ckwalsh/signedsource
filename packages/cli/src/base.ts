/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Command, Option } from 'clipanion';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable, Writable } from 'node:stream';

export abstract class SignedSourceCommandBase extends Command {
  file = Option.String({ required: false });

  abstract override execute(): ReturnType<Command['execute']>;

  protected async _getInputStream(): Promise<ReadableStream<string>> {
    let stream: ReadableStream<Uint8Array>;

    if (this.file === undefined || this.file === '-') {
      stream = Readable.toWeb(this.context.stdin);
    } else {
      const inputHandle = await fs.open(this.file);
      stream = inputHandle.readableWebStream();
    }

    return stream.pipeThrough(
      new TextDecoderStream(),
    ) as ReadableStream<string>;
  }
}
interface OutputStreamInfo {
  output: WritableStream<string>;
  outputCleanupCb: () => Promise<void>;
}

export abstract class TransformCommandBase extends SignedSourceCommandBase {
  output = Option.String('-o,--output');

  async execute() {
    const [input, { output, outputCleanupCb }] = await Promise.all([
      this._getInputStream(),
      this.#getOutputStream(),
    ]);

    const transformed = await this._getTransformStream(input);

    await transformed.pipeTo(output);

    await outputCleanupCb();
  }

  async #getOutputStream(): Promise<OutputStreamInfo> {
    const outputPath: string = this.output ?? this.file ?? '-';

    let output: WritableStream<string>;
    let outputCleanupCb: () => Promise<void>;

    if (outputPath === '-') {
      output = Writable.toWeb(this.context.stdout) as WritableStream<string>;
      outputCleanupCb = () => Promise.resolve();
    } else {
      let mode = 0x644; // Default to 644
      try {
        const stat = await fs.stat(outputPath);
        mode = stat.mode;
      } catch {
        // Do nothing
      }

      const tmpDir = await fs.mkdtemp('signedsource.tmp-');
      const tmpFile = path.join(tmpDir, 'output.tmp');

      const fh = await fs.open(tmpFile, 'wx', mode);

      output = Writable.toWeb(fh.createWriteStream()) as WritableStream<string>;

      outputCleanupCb = async () => {
        await fs.rename(tmpFile, outputPath);
        await fs.rm(tmpDir, { recursive: true });
      };
    }

    return { output, outputCleanupCb };
  }

  protected abstract _getTransformStream(
    input: ReadableStream<string>,
  ): Promise<ReadableStream<string>>;
}
