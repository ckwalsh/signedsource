/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignedContentHashes } from '../types/impl/analyzer.ts';

export interface HasherIf {
  update(chunk: string): void;
  digest(): Promise<SignedContentHashes>;
}

export type HasherStaticIf = new () => HasherIf;

class NeverHasher implements HasherIf {
  update(): void {
    // Do nothing
  }

  /* istanbul ignore start */
  /* c8 ignore start */
  digest(): Promise<SignedContentHashes> {
    return Promise.reject(new Error('NeverHasher should not be used'));
  }
  /* c8 ignore end */
  /* istanbul ignore end */
}

export const NEVER_HASHER = new NeverHasher();
