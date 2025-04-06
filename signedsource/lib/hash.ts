/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createHash, Hash } from 'crypto';

export function signatureHash(): Hash {
  return createHash('md5');
}

export function getSignatureToken(data: string | Hash): string {
  const h = data instanceof Hash ? data : signatureHash().update(data, 'utf8');

  return `SignedSource<<${h.digest('hex')}>>`;
}
