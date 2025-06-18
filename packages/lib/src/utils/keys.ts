/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CryptoKey, FlattenedVerifyGetKey, JWK } from 'jose';

export type SigningKey = CryptoKey | JWK | Uint8Array;
export type VerifyKey = SigningKey | FlattenedVerifyGetKey;

export function isJWK(key: VerifyKey): key is JWK {
  return typeof key === 'object' && 'kty' in key;
}
