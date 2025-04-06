/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class SignedSourceError extends Error {}

export class MissingSignaturePlaceholderError extends SignedSourceError {
  constructor() {
    super('Could not find signature placeholder in source');
  }
}

export class UnsignedDataError extends SignedSourceError {
  constructor() {
    super('Attempted to verify unsigned data');
  }
}
