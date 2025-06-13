/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEFAULT_PLACEHOLDER_TOKEN } from '../token.ts';
import type { ContentSignerIf } from '../types/content.ts';

export class NeverContentSigner implements ContentSignerIf {
  PLACEHOLDER = DEFAULT_PLACEHOLDER_TOKEN;

  /* istanbul ignore start */
  /* c8 ignore start */
  isValid(): Promise<boolean> {
    return Promise.reject(new Error('NeverContentSigner should not be used'));
  }

  assertIsValid(): Promise<void> {
    return Promise.reject(new Error('NeverContentSigner should not be used'));
  }

  sign(): Promise<never> {
    return Promise.reject(new Error('NeverContentSigner should not be used'));
  }
  /* c8 ignore end */
  /* istanbul ignore end */
}

export const NEVER_CONTENT_SIGNER = new NeverContentSigner();
