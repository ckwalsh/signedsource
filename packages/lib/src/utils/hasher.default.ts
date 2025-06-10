/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedContentHashes } from '../types/impl/analyzer.ts';
import type { HasherIf, HasherStaticIf } from './hasher.common.ts';

export * from './hasher.common.ts';

const encoder = new TextEncoder();

/**
 * @internal
 */
export class Hasher implements HasherIf {
  static readonly isAsync = true;

  private chunks: string[] = [];

  update(chunk: string): void {
    this.chunks.push(chunk);
  }

  async digest(): Promise<SignedContentHashes> {
    const data = this.chunks.join('');
    this.chunks.length = 0;

    const [md5Raw, sha256Raw] = await Promise.all([
      crypto.subtle.digest('MD5', encoder.encode(data)),
      crypto.subtle.digest('SHA-256', encoder.encode(data)),
    ]);

    return {
      md5: arrayBufferToHex(md5Raw),
      sha256: arrayBufferToHex(sha256Raw),
    };
  }
}

const _h: HasherStaticIf = Hasher;

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
