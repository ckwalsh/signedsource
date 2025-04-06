/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UNSIGNED_PLACEHOLDER } from '../constants.js';
import { UnsignedDataError } from '../errors.js';
import { unsignSource } from '../unsign.js';
import { assemblePartiallySignedSource, parsePartiallySignedSource } from './impl.js';

export function signSource(source: string, oldSource?: string): string {
  const unsignedSource = unsignSource(source);

  const parsed = parsePartiallySignedSource(unsignedSource.source);

  const manualChunkOverrides = oldSource === undefined ? {} : parsePartiallySignedSource(oldSource).manualChunkContents;

  const assembledUnsignedSource = assemblePartiallySignedSource(parsed, manualChunkOverrides);

  return assembledUnsignedSource.replace(UNSIGNED_PLACEHOLDER, parsed.signature);
}

export function verifySignedSource(source: string): boolean {
  const unsignedSource = unsignSource(source);

  if (unsignedSource.embeddedSignature === undefined) {
    throw new UnsignedDataError();
  }

  const parsed = parsePartiallySignedSource(unsignedSource.source);

  return parsed.signature === unsignedSource.embeddedSignature;
}
