/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UNSIGNED_PLACEHOLDER } from './constants.js';
import { MissingSignaturePlaceholderError } from './errors.js';

export interface UnsignedSource {
  source: string;
  embeddedSignature?: string;
}

const UNSIGNED_TOKEN_PATTERN = /@(?:partially-)?generated <<SignedSource::\*O\*zOeWoEQle#\+L!plEphiEmie@IsG>>/;
const SIGNED_TOKEN_PATTERN = /@(?:partially-)?generated (SignedSource<<([0-9a-f]{32})>>)/;

export function unsignSource(signedSource: string): UnsignedSource {
  if (UNSIGNED_TOKEN_PATTERN.test(signedSource)) {
    return {
      source: signedSource,
    };
  }

  const signatureMatch = SIGNED_TOKEN_PATTERN.exec(signedSource);

  if (signatureMatch === null) {
    throw new MissingSignaturePlaceholderError();
  }

  const embeddedSignature = signatureMatch[1];
  const source = signedSource.replace(embeddedSignature, UNSIGNED_PLACEHOLDER);

  return {
    source,
    embeddedSignature,
  };
}
