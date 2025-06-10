/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EMBEDDED_JWT_CONTENT_VERIFIER } from './jws.ts';
import { LEGACY_CONTENT_SIGNER } from './legacy.ts';
import { MultiplexContentVerifier } from './multiplex.ts';

export class DefaultContentVerifier extends MultiplexContentVerifier {
  constructor() {
    super({
      verifiers: [LEGACY_CONTENT_SIGNER, EMBEDDED_JWT_CONTENT_VERIFIER],
    });
  }
}

export const DEFAULT_CONTENT_VERIFIER = new DefaultContentVerifier();
