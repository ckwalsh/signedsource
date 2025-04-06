/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UNSIGNED_PLACEHOLDER } from '../constants.js';
import { UnsignedDataError } from '../errors.js';
import { getSignatureToken } from '../hash.js';
import { unsignSource } from '../unsign.js';

export function signSource(source: string): string {
  const unsignedSource = unsignSource(source);

  const signature = getSignatureToken(unsignedSource.source);

  return unsignedSource.source.replace(UNSIGNED_PLACEHOLDER, signature);
}

export function verifySignedSource(source: string): boolean {
  const unsignedSource = unsignSource(source);

  if (unsignedSource.embeddedSignature === undefined) {
    throw new UnsignedDataError();
  }

  return getSignatureToken(unsignedSource.source) === unsignedSource.embeddedSignature;
}

export default {
  sign: signSource,
  verify: verifySignedSource,
};
