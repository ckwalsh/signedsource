/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Hash } from 'node:crypto';
import { createHash } from 'node:crypto';

import type { SignedContentHashes } from '../types/impl/analyzer.ts';
import type { HasherIf, HasherStaticIf } from './hasher.common.ts';

export * from './hasher.common.ts';

export class Hasher implements HasherIf {
  private md5: Hash = createHash('md5');
  private sha256: Hash = createHash('sha256');

  update(chunk: string): void {
    this.md5.update(chunk);
    this.sha256.update(chunk);
  }

  digest(): Promise<SignedContentHashes> {
    return Promise.resolve({
      md5: this.md5.digest('hex'),
      sha256: this.sha256.digest('hex'),
    });
  }
}

const _h: HasherStaticIf = Hasher;
