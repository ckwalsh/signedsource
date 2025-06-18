/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CryptoJS from 'crypto-js';

import type { SignedContentHashes } from '../types/impl/analyzer.ts';
import type { HasherIf, HasherStaticIf } from './hasher.common.ts';

export * from './hasher.common.ts';

const encoder = new TextEncoder();

export class Hasher implements HasherIf {
  static readonly isAsync = true;

  #chunks: string[] = [];

  update(chunk: string): void {
    this.#chunks.push(chunk);
  }

  async digest(): Promise<SignedContentHashes> {
    const data = this.#chunks.join('');
    this.#chunks.length = 0;

    const md5 = CryptoJS.enc.Hex.stringify(CryptoJS.MD5(data));

    const sha256Raw = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(data),
    );
    const sha256 = arrayBufferToHex(sha256Raw);

    return { md5, sha256 };
  }
}

const _h: HasherStaticIf = Hasher;

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
