/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as full from './full/index.js';
import * as partial from './partial/index.js';
import { MissingSignaturePlaceholderError } from './errors.js';

export function signSource(source: string, oldSource?: string): string {
  if (source.includes(full.GENERATED_TAG)) {
    return full.signSource(source);
  } else if (source.includes(partial.GENERATED_TAG)) {
    return partial.signSource(source, oldSource);
  }

  throw new MissingSignaturePlaceholderError();
}

export function verifySignedSource(source: string): boolean {
  if (source.includes(full.GENERATED_TAG)) {
    return full.verifySignedSource(source);
  } else if (source.includes(partial.GENERATED_TAG)) {
    return partial.verifySignedSource(source);
  }

  throw new MissingSignaturePlaceholderError();
}
