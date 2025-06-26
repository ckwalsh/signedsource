/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JWK } from 'jose';

export function isJWK(key: unknown): key is JWK {
  return key !== null && typeof key === 'object' && 'kty' in key;
}

export function getPublicJWK(jwk: JWK): JWK {
  const { d, dp, dq, p, q, qi, ...pubKey } = jwk;

  return pubKey;
}
