/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FlattenedVerifyGetKey, JWK } from 'jose';
import type { KeyObject, webcrypto } from 'node:crypto';

/** @public get knip to ignore */
export type ValidatingKey =
  | webcrypto.CryptoKey
  | KeyObject
  | JWK
  | Uint8Array
  | FlattenedVerifyGetKey;

/** @public get knip to ignore */
export type SigningKey = webcrypto.CryptoKey | KeyObject | JWK | Uint8Array;

export * from './common.ts';
