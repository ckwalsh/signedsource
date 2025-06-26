/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedContentHashes } from '../../types.ts';

export interface HasherIf {
  update(chunk: string): void;
  digest(): Promise<SignedContentHashes>;
}

export interface SyncHasherIf {
  update(chunk: string): void;
  syncDigest(): SignedContentHashes;
}

export type HasherCtor = new () => HasherIf;
export type SyncHasherCtor = new () => SyncHasherIf;

export class NeverHasher implements HasherIf, SyncHasherIf {
  update(): void {
    // Do nothing
  }

  /* istanbul ignore start */
  /* c8 ignore start */
  digest(): Promise<SignedContentHashes> {
    return Promise.reject(new Error('NeverHasher should not be used'));
  }

  syncDigest(): SignedContentHashes {
    throw new Error('NeverHasher should not be used');
  }
  /* c8 ignore end */
  /* istanbul ignore end */
}
